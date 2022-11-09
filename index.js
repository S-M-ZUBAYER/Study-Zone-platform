const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.p2sr91x.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJwtToken(req, res, next) {
    const authenticHeader = req.headers.authorization;
    if (!authenticHeader) {
        return res.status(401).send({ message: 'unauthorized access' })
    }

    const token = authenticHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(401).send({ message: 'unauthorized access' })
        }
        req.decoded = decoded;
        next();
    })
}
async function run() {
    try {
        const serviceCollection = client.db('KidSpace').collection('services');
        const orderCollection = client.db("KidSpace").collection('Orders');
        const reviewCollection = client.db("KidSpace").collection('reviews');

        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
            res.send({ token });
        })

        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        })
        app.get('/limitedServices', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.limit(3).toArray();
            res.send(services);
        })

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        })

        app.get('/reviews', async (req, res) => {
            const query = {};
            const cursor = reviewCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        })

        // get specific data;
        app.get('/myReviews', verifyJwtToken, async (req, res) => {
            const decoded = req.decoded;
            console.log('inside', decoded)
            if (decoded.email !== req.query.email) {
                res.status(403).send({ message: 'forbidden access' })
            }
            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        })

        // order api section

        app.post('/services', verifyJwtToken, async (req, res) => {
            const service = req.body;
            const result = await serviceCollection.insertOne(service);
            res.send(result);

        })
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);

        })
        app.post('/reviews', async (req, res) => {
            const order = req.body;
            const result = await reviewCollection.insertOne(order);
            res.send(result);

        })

        app.delete('/myReviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        })



    }
    finally {

    }

}
run()
    .catch(err => console.log(err));



app.get('/', (req, res) => {
    res.send('KidSpace server site is running')
})
app.listen(port, () => {
    console.log(`KidSpace server is running on port: ${port}`)
})
