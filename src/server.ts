import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles, validURL} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  app.get( "/filteredimage/", async ( req, res) => {
    try{
      // Get Query Image URL
      const image_url  = req.query.image_url as string;

      if(!image_url){
          //Return Status 400, if image URL string is empty
          return res.status(400).send('No URL was submitted!');
      }
      // Helpfer Function to check for validity of URL
      const checkurl = await validURL(image_url);
      if(checkurl===false){
          //Return Status 415, if image URL is malformed / not supported
          return res.status(415).send('This IMG/URL is not supported.');
      }
      // Use Helpfer Function to download picture and filter from image url
      const filteredURL = await filterImageFromURL(image_url);
      // Send filtered file with Statuscode 200     
      res.status(200).sendFile(filteredURL);
      // Add file to files array and submit for deletion
      let files: Array<string> =[filteredURL]; 
      // Use helpfer function to delete all files
      res.on('finish', async () => await deleteLocalFiles(files));
    } catch (e){
        return res.status(500).send(e.message);
    }

  } );
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();