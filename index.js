const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express()
const port =process.env.PORT || 5000;

app.use(cors());
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.v3avrd5.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res , next){
  const authHeader = req.headers.authorization;
  if(!authHeader){
    return res.status(401).send({ message: 'unauthorized' })
  }
  const token= authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
    if(err){
      res.status(401).send({message: 'unauthorized access'})
    }
    req.decoded = decoded;
    next();
  })
}

async function run (){
  try{
    const serviceCollection = client.db('cesarPhotography').collection('services')
    const commentCollection = client.db('cesarPhotography').collection('comments')

    app.post('/jwt', (req, res) =>{
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})
      res.send({token})
    })

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


    app.get('/reviews', verifyJWT, async (req, res) => {
      const decoded = req.decoded;
      console.log("ins or api", decoded)
      if(decoded.email !== req.query.email){
        res.status(403).send({ message: 'unauthorize access' })
      }
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