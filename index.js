const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();

const port = process.env.PORT || 8000 ;

app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hxrsyqo.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const learnLairCollection = client.db('learnLairDB').collection('allData');
const learnLairCandidateDataCollection = client.db('learnLairDB').collection('candidateData');
const learnLairReviewCollection = client.db('learnLairDB').collection('review');

app.get('/getData', async(req,res)=>{
    const result = await learnLairCollection.find().toArray();
    res.send(result);
});

  app.get('/getData/:id' , async(req,res)=>{
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await learnLairCollection.findOne(query);
    res.send(result);
  });

  app.get("/searchName/:text", async (req, res) => {
    const indexKeys = { collegeName: 1 };
    const indexOptions = { collegeName:"collegeName" };
    const result2 = await learnLairCollection.createIndex(indexKeys, indexOptions);
    const text = req.params.text;
    const result = await learnLairCollection
      .find({
        $or: [
          { collegeName: { $regex: text, $options: "i" } },
        ],
      })
      .toArray();
    res.send(result);
  }); 

app.post('/addCandidateData' , async(req,res)=>{
    const storeCandidateData = req.body;
    const result = await learnLairCandidateDataCollection.insertOne(storeCandidateData);
    res.send(result);
  });

app.get('/myCollege/:email', async(req,res)=>{
    const email = req.params.email;
    const filter = {email : email}
    const result = await learnLairCandidateDataCollection.find(filter).toArray();
    res.send(result);
});

app.get('/editCandidateData/:id' , async(req,res)=>{
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await learnLairCandidateDataCollection.findOne(query);
  res.send(result);
});

app.patch('/updateCandidateData/:id' , async(req,res)=>{
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const updateData = {
    $set: {
      candidateName: req.body.candidateName,
      candidateEmail: req.body.candidateEmail,
      address: req.body.address,
      collegeName: req.body.collegeName
    },
  };
  const result = await learnLairCandidateDataCollection.updateOne(query,updateData);
  res.send(result);
})

app.post('/addReview' , async(req,res)=>{
  const storeReview = req.body;
  const result = await learnLairReviewCollection.insertOne(storeReview);
  res.send(result);
});

app.get('/getReview', async(req,res)=>{
  const result = await learnLairReviewCollection.find().toArray();
  res.send(result);
});


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/',(req,res)=>{
    res.send('learnLair server running')
});

app.listen(port ,()=>{
    console.log(`learnLair server running on terminal : ${port}`)
});