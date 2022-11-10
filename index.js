const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express()
const port =process.env.PORT || 5000;

app.use(cors());
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.v3avrd5.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run (){
  try{
    const serviceCollection = client.db('cesarPhotography').collection('services')
    const commentCollection = client.db('cesarPhotography').collection('comments')
    app.get('/services', async(req, res)=>{
        const query = {}
        const cursor =serviceCollection.find(query);
        const services = await cursor.toArray();
        res.send(services);
    });

    app.get('/serviceslimit', async(req, res)=>{
        const query = {}
        const cursor =serviceCollection.find(query);
        const services = await cursor.limit(3).toArray();
        res.send(services);
    });

    app.get('/services/:id', async(req,res)=>{
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query)
      res.send(service);
    });

    app.post('/services', async (req, res) => {
      const postServices = req.body;
      const result = await serviceCollection.insertOne(postServices);
      res.send(result);

    })


    app.get('/reviews', async (req, res) => {
      let query = {};
      if (req.query.email) {
        query = {
          email: req.query.email
        }
      }
      const cursor = commentCollection.find(query);
      const orders = await cursor.toArray();
      res.send(orders);
    })


    app.post('/reviews', async (req, res) => {
      const reviews = req.body;
      const result = await commentCollection.insertOne(reviews);
      res.send(result);

    })

    app.delete('/reviews/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await commentCollection.deleteOne(query);
      res.send(result);
    })

    app.get('/reviews/:id', async (req, res) => {
      const id = req.params.id;
      const query = { id };
      const result =  commentCollection.find(query);
      const service = await result.toArray()
      res.send(service);
    })

  }
  finally{

  }
}

run().catch(err =>console.error(err))


app.get('/',(req, res) =>{
  res.send('server is running')
})

app.listen(port, ()=>{
  console.log(`Server is running 0n ${port}`)
})