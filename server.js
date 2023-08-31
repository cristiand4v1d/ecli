const express = require('express')
const { FieldValue } = require('firebase-admin/firestore')
const app = express()
const port = 3000
const { db } = require('./firebase.js')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors')

app.use(express.json())
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:your_port'); // Reemplaza con tu puerto
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
app.use(cors({
    origin: '*', // Reemplaza con tu puerto
    //methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: false // Habilita el uso de cookies y credenciales de autenticación
}));


app.get('/intereses', async (req, res) => {
    try {
        const querySnapshot = await db.collection("intereses").get();
        const contacts = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        res.status(200).send(contacts)
    } catch (error) {
        console.error(error);
    }
})


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
        res.status(200).send(querySnapshot.data())
    } catch (error) {
        console.error(error);
    }
})

app.post('/actualizar-ususario', async (req, res) => {
    console.log(req.body)
    try {
        // const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ6MVlyU1A0MFg2amxIY1lXbVl6QSIsImlhdCI6MTY5MzQ0Mjg2MSwiZXhwIjoxNjkzNDQ2NDYxfQ.3zVjls0Erry2zNz85H01wciFnej7q7VNL4p2QPDRZPE"
        const token = req.header('Authorization');
        //console.log(token)
        if (!token) {
            return res.status(401).send("No token provided");
        }

        jwt.verify(token, 'lemus', async (error, decoded) => {
            if (error) {
                return res.status(401).send("Invalid token");
            }

            const userId = decoded.userId;

           

            const userSnapshot = await db.collection("usuarios").doc(userId).get();

            if (!userSnapshot.exists) {
                return res.status(404).send("User not found");
            }

            const userData = userSnapshot.data();

            // Update user data based on the request body
            // For example, you can update specific fields like this:
            const updatedUserData = req.body;
            await db.collection("usuarios").doc(userId).set(updatedUserData, { merge: true });


            res.status(200).json(userData);
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

app.post('/addfriend', async (req, res) => {
    const data = req.body
    await db.collection("usuarios").add({
        data
    })
    res.status(200).send(data)
})

app.post('/agregar-interes', async (req, res) => {
    let data = req.body
    data = data.nombre
    await db.collection("intereses").add({
        "nombre": data
    })
    res.status(200).send(data)
})

app.post('/register', async (req, res) => {
    try {
        const userData = req.body;

        // Perform validation on userData, e.g., check for required fields
         // Validate required fields and username uniqueness
         if (!userData.username || !userData.password) {
            return res.status(400).send("Username and password are required");
        }

        const existingUserSnapshot = await db.collection("usuarios").where("username", "==", userData.username).get();
        if (!existingUserSnapshot.empty) {
            return res.status(409).send("usuario ya existe");
        }

        // Hash the password before storing it in the database
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

        // Replace the plain password with the hashed password in the userData
        userData.password = hashedPassword;

        // You can also perform any additional processing or data transformation

        const newUserRef = await db.collection("usuarios").add(userData);
        res.status(201).send({ id: newUserRef.id });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        //console.log("lemus")
        // Retrieve user from the database based on the provided username
        const userSnapshot = await db.collection("usuarios").where("username", "==", username).get();

        if (userSnapshot.empty) {
            return res.status(401).send("Invalid username or password");
        }

        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();

        // Compare the provided password with the stored hashed password
        const passwordMatch = await bcrypt.compare(password, userData.password);

        if (!passwordMatch) {
            return res.status(401).send("Invalid username or password");
        }

        // If username and password are correct, generate a JWT token
        const token = jwt.sign({ userId: userDoc.id }, 'lemus', { expiresIn: '1h' });

        res.status(200).json({ "token": token, "success": true });
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
});

app.get('/profile', async (req, res) => {
    
    try {
        const token = req.header('Authorization');


        if (!token) {
            return res.status(401).send("No token provided");
        }

        jwt.verify(token, 'lemus', async (error, decoded) => {
            if (error) {
                return res.status(401).send("Invalid token");
            }

            const userId = decoded.userId;
            const userSnapshot = await db.collection("usuarios").doc(userId).get();

            if (!userSnapshot.exists) {
                return res.status(404).send("User not found");
            }

            const userData = userSnapshot.data();
            res.status(200).json(userData);
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


app.listen(port, () => console.log(`Server has started on port: ${port}`))