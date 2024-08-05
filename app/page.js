'use client'
import Image from 'next/image';
import {useState, useEffect} from 'react';
import {Box, Container, Stack, Typography, Modal, TextField, Button} from '@mui/material';
import {storage, firestore} from '@/firebase';
import {collection, query, getDocs, setDoc, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {Cam} from './components/Cam.js'


export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [identifiedObject, setIdentifiedObject] = useState(null);
  const [buttonText, setButtonText] = useState("")

   const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) =>{
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
        
      })
    })
    
    setInventory(inventoryList);
  } 
  const addItem = async (item, image) => {
    console.log("adding item")
    if (!item || !image) {
      console.error("Error: Item or image is undefined");
      return;
    }
  
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
  
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 }, { merge: true });
    } else {
      await setDoc(docRef, { quantity: 1, image: image });
    }
    await updateInventory();
  };
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if(docSnap.exists()){

      const {quantity} = docSnap.data()

      if (quantity ==1){
        await deleteDoc(docRef)
        console.log(`${item} removed from inventory.`);

      } else{ 
        await setDoc(docRef, {quantity: quantity-1})
      }
    }
    await updateInventory()
  }
    useEffect(() => {
      updateInventory()
    }, [])
    const [searchTerm, setSearchTerm] = useState('');

  // Filter the data based on the search term
    const filteredInventory = inventory.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
    const handleOpen = () => setOpen(true)
    const handleClose = () => setOpen(false)

    const handleObjectIdentified = (object, imageUrl) => {
      if (imageUrl) {
        console.log("Identified object and image URL:", object, imageUrl);
        setIdentifiedObject({ name: object, image: imageUrl });
        setButtonText("Add Item To Inventory");
      } else {
        console.error("Error: Image URL is undefined");
      }
    };
    const handleAddIdentifiedObject = () => {
      if (identifiedObject && identifiedObject.name && identifiedObject.image) {
        console.log("Adding item to inventory:", identifiedObject);
        addItem(identifiedObject.name, identifiedObject.image);
        setIdentifiedObject(null);
        setButtonText("Added to Inventory!");
      } else {
        console.error("Error: Identified object or image URL is missing");
      }
    };

  return (
    <Box width = "100vw" flexDirection="column" height = "100vh" display = "flex" sx={{justifyContent:"center", alignItems: "center", overflow:"auto", height:"100%", marginTop:"50px" }} gap={2} >
      <Modal open={open} onClose={handleClose} >
        <Box position="absolute" top="50%" left="50%" sx={{transform: "translate(-50%, -50%)",}} width={400} bgcolor="white" border="2px solid #000" boxShadow={24} p={4} display="flex" flexDirection="column" gap={3}>

        <Typography variant="h6">Add Item</Typography>
        <Stack width="100%" direction="row" spacing={2}>
          <TextField variant="outlined"
          fullWidth
          value={itemName}
          onChange={(e) => {
            setItemName(e.target.value)
          }}>
          
          </TextField>
          <Button
          variant="outlined"
          onClick={() => {
            addItem(itemName, "NA")
            setItemName('')
            handleClose()
          }}>Add

          </Button>
        </Stack>

        </Box>
      </Modal>
      <Button
      variant="contained"
      onClick={()=>{
        handleOpen()
      }}>Add New Item</Button>
      <Box border="1px solid #333">
        <Box
        width="800px"
        height="100px"
        bgcolor="#ADD8E6"
        display="flex"
        alignItems="center"
        justifyContent="center">
          <Typography
          variant="h3"
          color="#333"
          textAlign="center"
          sx={{
            fontSize:"40px",
          }}>
          Inventory Items
          </Typography>
          <TextField
        label="Search"
        sx={{width:"400px",
            marginLeft:"40px"}}
        
        variant="outlined"
        display="flex"
        alignItems="center"
        margin="normal"
        value={searchTerm}
        
        onChange={e => setSearchTerm(e.target.value)}
      />
        </Box>
        

      
      <Stack
      width="800px"
      height="300px"
      spacing={2}
      overflow="auto">
        {
          filteredInventory.map(({name, quantity})=> (
            <Box key={name} width ="100%" minHeight="120px" display="flex" alignItems="center" justifyContent="space-between" bgcolor="#f0f0f0" padding={4} >
            <Box width="50%" display="flex" alignItems="center">
              <Typography variant="h3" color ="#333" textAlign="center" sx={{fontSize:"25px"}}>{name.charAt(0).toUpperCase() + name.slice(1)}</Typography>
            </Box>
            <Box width="50%" display="flex" sx={{justifyContent:"space-between"}} >
                <Typography variant="h3" color ="#333" textAlign="center">{quantity}</Typography>
              <Stack direction="row" spacing={2}>
                <Button variant="contained" onClick={()=> {
                addItem(name, "a")
              }}>
                Add
              </Button>
              <Button variant="contained" onClick={()=> {
                removeItem(name)
              }}>
                Remove
              </Button>
              </Stack>
              </Box>
            </Box>
          ))}
      </Stack>
      </Box>
      <Container display="flex" justifyContent="center">
        <Box>
            <Cam onObjectIdentified={handleObjectIdentified} />
        </Box>
      </Container>
      <Box>
      
          <Box>
       {identifiedObject && (
        <Box>
        <Typography variant="h4" textAlign="center">{identifiedObject.name}</Typography>
      <Button variant="contained" onClick={handleAddIdentifiedObject} disabled={!identifiedObject} sx={{ marginTop: 2 }}>
        
            Add Identified Item to Inventory
          </Button>
          </Box>
          )}
          
          </Box>
        
        
        </Box>
      
    </Box>
    
  )
}
