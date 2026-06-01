const { MongoClient } = require('mongodb');

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
    if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb };
    }
    
    // Password tanpa < dan >, hanya plain text
    const uri = "mongodb+srv://Leoly:Bangsat88@leoly.9rhahjy.mongodb.net/";
    const dbName = "leoly_portfolio";
    
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    
    cachedClient = client;
    cachedDb = db;
    
    return { client, db };
}

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
        'Content-Type': 'application/json'
    };
    
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers, body: '' };
    }
    
    try {
        const { db } = await connectToDatabase();
        const pathParts = event.path.split('/');
        const collectionName = pathParts[pathParts.length - 1];
        
        const validCollections = ['projects', 'products', 'faqs', 'testimonials', 'home_content'];
        if (!validCollections.includes(collectionName)) {
            return { statusCode: 404, headers, body: JSON.stringify({ error: 'Collection not found' }) };
        }
        
        const collection = db.collection(collectionName);
        
        // GET: Ambil data
        if (event.httpMethod === 'GET') {
            const data = await collection.find({}).toArray();
            return { statusCode: 200, headers, body: JSON.stringify(data) };
        }
        
        // POST: Tambah data
        if (event.httpMethod === 'POST') {
            const body = JSON.parse(event.body);
            const result = await collection.insertOne({
                ...body,
                created_at: new Date().toISOString()
            });
            return { statusCode: 200, headers, body: JSON.stringify({ ...body, _id: result.insertedId }) };
        }
        
        // PUT: Update data
        if (event.httpMethod === 'PUT') {
            const { id, ...updateData } = JSON.parse(event.body);
            const { ObjectId } = require('mongodb');
            delete updateData._id;
            
            const result = await collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { ...updateData, updated_at: new Date().toISOString() } }
            );
            
            return { statusCode: 200, headers, body: JSON.stringify({ success: result.modifiedCount > 0 }) };
        }
        
        // DELETE: Hapus data
        if (event.httpMethod === 'DELETE') {
            const { id } = JSON.parse(event.body);
            const { ObjectId } = require('mongodb');
            const result = await collection.deleteOne({ _id: new ObjectId(id) });
            return { statusCode: 200, headers, body: JSON.stringify({ success: result.deletedCount > 0 }) };
        }
        
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
        
    } catch (error) {
        console.error('Error:', error);
        return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
    }
};