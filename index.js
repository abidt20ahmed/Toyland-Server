const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.surgvec.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        
        
        const toyCollection = client.db('toylandUser').collection('toys')
        
        app.post('/postToy', async (req, res) => {
            const body = req.body;
            console.log(body);
            const result = await toyCollection.insertOne(body);
            console.log(req);
            res.send(result)
        });
        
        app.patch('/updateToy/:id', async(req, res) => {
            const id = req.params.id;
            const filter = {_id: new ObjectId(id)}
            const updateDoc = { $set: req.body };
            // console.log(updatedToy.status);
            // const updateDoc = {
            //     $set: {
            //         status: updatedToy.status
            //     },
            // };
            const result = await toyCollection.updateOne(filter, updateDoc);
            res.send(result)
        })
        
        app.get('/allToys/:type', async (req, res) => {
            console.log(req.params.type);
            if(req.params.type == 'Regular' || req.params.type == 'Sports' || req.params.type == 'Truck'){
                const result = await toyCollection.find({category: req.params.type}).sort({ date: -1 }).toArray();
                res.send(result)
            }
            else{
                const result = await toyCollection.find({}).sort({ date: -1 }).toArray();
                res.send(result);
            }
        })
        
        
        const indexKeys = { productName: 1, brand: 1 };
        const indexOptions = { name: 'brandName '};
        const result = await toyCollection.createIndex(indexKeys, indexOptions)
        
        app.get('/allToy/:productName', async (req, res) => {
            const searchText = req.params.productName;
            // const result = await toyCollection.find({ productName: req.params.productName}).toArray();
            const result = await toyCollection.find({
                $or: [
                    { productName: {$regex: searchText, $options: 'i'}},
                    { brand: { $regex: searchText, $options: 'i'}}
                ]
            }).toArray();
            res.send(result);
        })
        
        
        app.get('/myToys/:email', async (req, res) => {
            if(req.query.sort == 'asc'){
            const result = await toyCollection.find({ email: req.params.email}).sort({ price: 1 }).toArray();
            res.send(result);

            }
            else{
            const result = await toyCollection.find({ email: req.params.email}).sort({ price: -1 }).toArray();
            res.send(result);
            }

        })
        
        
        app.get('/details/:id', async (req, res) => {
            console.log(req.params.id);
            const id = req.params.id;
            const result = await toyCollection.findOne({_id: new ObjectId(id)});
            res.send(result)
        })
        
        
        app.delete('/myToys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id)}
            const result = await toyCollection.deleteOne(query);
            res.send(result)
        })
        
        
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('market running')
})

app.listen(port, () => {
    console.log(`Running Server port ${port}`);
})