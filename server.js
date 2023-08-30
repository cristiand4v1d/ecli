const express = require('express')
const { FieldValue } = require('firebase-admin/firestore')
const app = express()
const port = 3000
const { db } = require('./firebase.js')

app.use(express.json())

const friends = {
    'james': 'friend',
    'larry': 'friend',
    'lucy': 'friend',
    'banana': 'enemy',
}

app.get('/usuarios', async (req, res) => {
    try {
        const querySnapshot = await db.collection("usuarios").get();
        const contacts = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        res.status(200).send(contacts)
    } catch (error) {
        console.error(error);
    }
})

app.get('/usuarios/:id', async (req, res) => {
    try {
        const querySnapshot = await db.collection("usuarios").doc(req.params.id).get();
        res.status(200).send(querySnapshot)
    } catch (error) {
        console.error(error);
    }
})

app.post('/addfriend', async (req, res) => {
    const data = req.body
    await db.collection("usuarios").add({
        data
    })
    /* const peopleRef = db.collection('usuarios').doc('associates')
    const res2 = await peopleRef.set({
        [name]: status
    }, { merge: true }) */
    // friends[name] = status
    res.status(200).send(data)
})

app.patch('/changestatus', async (req, res) => {
    const { name, newStatus } = req.body
    const peopleRef = db.collection('people').doc('associates')
    const res2 = await peopleRef.set({
        [name]: newStatus
    }, { merge: true })
    // friends[name] = newStatus
    res.status(200).send(friends)
})

app.delete('/friends', async (req, res) => {
    const { name } = req.body
    const peopleRef = db.collection('people').doc('associates')
    const res2 = await peopleRef.update({
        [name]: FieldValue.delete()
    })
    res.status(200).send(friends)
})

app.listen(port, () => console.log(`Server has started on port: ${port}`))