const express = require('express')
const { FieldValue } = require('firebase-admin/firestore')
const app = express()
const port = 3000
const { db } = require('./firebase.js')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const http = require('http');
const firebaseAdmin = require('firebase-admin');
/* const { Server } = require("socket.io");
const http = require('http');

const server = http.createServer(app); */
//const io = new Server(server);

/* const io = require('socket.io')(http, {
  cors: {
    origins: ['*']
  }
}); */

const server = http.createServer(app);
const { Server } = require("socket.io");
const io = require('socket.io')(server, {
    cors: {
        origin: '*',
    }
});

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
        /* const querySnapshot = await db.collection("intereses").get();
        const contacts = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })); */
        const queryliteratura = await db.collection("literatura").get();
        const literatura = queryliteratura.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        const querymusica = await db.collection("musica").get();
        const musica = querymusica.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        res.status(200).send({ "literatura": literatura, "musica": musica })
    } catch (error) {
        console.error(error);
    }
})

app.get('/all-interests', async (req, res) => {
    try {
        const queryIntereses = await db.collection("intereses").get();
        const intereses = queryIntereses.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        res.status(200).send(intereses)
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
                return res.status(404).send({ "message": "User not found" });
            }

            const userData = userSnapshot.data();

            // Update user data based on the request body
            // For example, you can update specific fields like this:
            const updatedUserData = req.body;
            await db.collection("usuarios").doc(userId).set(updatedUserData, { merge: true });


            res.status(200).send({ "message": "Actualizado correctamente" });
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ "message": "Internal Server Error" });
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
    try {
        const token = req.header('Authorization');

        if (!token) {
            return res.status(401).send({ "message": "No token provided" });
        }

        jwt.verify(token, 'lemus', async (error, decoded) => {
            if (error) {
                return res.status(401).send({ "message": "Token no válido" });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ "message": "Internal Server Error" });
    }
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
            return res.status(400).send({ "message": "Username and password are required" });
        }

        const existingUserSnapshot = await db.collection("usuarios").where("username", "==", userData.username).get();
        if (!existingUserSnapshot.empty) {
            return res.status(400).send({ "message": "usuario ya existe" });
        }

        // Hash the password before storing it in the database
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

        // Replace the plain password with the hashed password in the userData
        userData.password = hashedPassword;

        // You can also perform any additional processing or data transformation

        const newUserRef = await db.collection("usuarios").add(userData);
        res.status(201).send({ "message": "Registro exitoso." });
    } catch (error) {
        console.error(error);
        res.status(500).send({ "message": "Internal Server Error" });
    }
});


app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        //console.log("lemus")
        // Retrieve user from the database based on the provided username
        const userSnapshot = await db.collection("usuarios").where("username", "==", username).get();

        if (userSnapshot.empty) {
            return res.status(401).send({ "message": "Usuario o contraseña inválidos" });
        }

        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();

        // Compare the provided password with the stored hashed password
        const passwordMatch = await bcrypt.compare(password, userData.password);

        if (!passwordMatch) {
            return res.status(401).send({ "message": "Usuario o contraseña inválidos" });
        }

        // If username and password are correct, generate a JWT token
        const token = jwt.sign({ userId: userDoc.id }, 'lemus', { expiresIn: '1h' });

        res.status(200).json({ "token": token, "user": userDoc.id, "success": true });
    } catch (error) {
        res.status(500).send({ "message": "Internal Server Error" });
    }
});

app.get('/profile', async (req, res) => {

    try {
        const token = req.header('Authorization');
        console.log(token)

        if (!token) {
            return res.status(401).send({ "message": "No token provided" });
        }

        jwt.verify(token, 'lemus', async (error, decoded) => {
            if (error) {
                return res.status(401).send({ "message": "Token no válido" });
            }

            const userId = decoded.userId;
            const userSnapshot = await db.collection("usuarios").doc(userId).get();

            if (!userSnapshot.exists) {
                return res.status(404).send({ "message": "User not found" });
            }

            const userData = userSnapshot.data();
            res.status(200).json(userData);
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ "message": "Internal Server Error" });
    }
});


app.post('/agregar-interes/musica', async (req, res) => {
    try {
        const token = req.header('Authorization');

        if (!token) {
            return res.status(401).send({ "message": "No token provided" });
        }

        jwt.verify(token, 'lemus', async (error, decoded) => {
            if (error) {
                return res.status(401).send({ "message": "Token no válido" });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ "message": "Internal Server Error" });
    }
    let data = req.body
    data = data.nombre
    await db.collection("musica").add({
        "nombre": data
    })
    res.status(200).send(data)
})

app.post('/agregar-interes/literatura', async (req, res) => {
    try {
        const token = req.header('Authorization');

        if (!token) {
            return res.status(401).send({ "message": "No token provided" });
        }

        jwt.verify(token, 'lemus', async (error, decoded) => {
            if (error) {
                return res.status(401).send({ "message": "Token no válido" });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ "message": "Internal Server Error" });
    }
    let data = req.body
    data = data.nombre
    await db.collection("literatura").add({
        "nombre": data
    })
    res.status(200).send(data)
})

app.get('/compatibles', async (req, res) => {
    try {
        const token = req.header('Authorization');

        if (!token) {
            return res.status(401).send({ "message": "No se proporcionó ningún token" });
        }

        jwt.verify(token, 'lemus', async (error, decoded) => {
            if (error) {
                return res.status(401).send({ "message": "Token no válido" });
            }

            // Si el token es válido, procede a buscar compatibilidades
            try {
                const querySnapshot = await db.collection("usuarios").get();
                const usuarios = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                let categoriasIntereses = [];
                try {
                    const queryIntereses = await db.collection("intereses").get();
                    categoriasIntereses = queryIntereses.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                } catch (error) {
                    console.error(error);
                }

                categoriasIntereses = categoriasIntereses.map(categoria => categoria.nombre);

                let existingMatches = [];

                // Obtener todos los matches existentes de la base de datos
                const queryMatches = await db.collection("matches").get();
                existingMatches = queryMatches.docs.map((doc) => doc.data());

                // Array para almacenar los nuevos matches a agregar
                let newMatches = [];

                for (let i = 0; i < usuarios.length; i++) {
                    for (let j = 0; j < usuarios.length; j++) {
                        if (i !== j) {
                            const compatibilidad = calcularCompatibilidad(usuarios[i], usuarios[j], categoriasIntereses);

                            if (compatibilidad > 0) {
                                // Verificar si ya existe un match con estos usuarios
                                const existingMatch = existingMatches.find(match =>
                                    (match.usuario1.id === usuarios[j].id && match.usuario2.id === usuarios[i].id) ||
                                    (match.usuario1.id === usuarios[i].id && match.usuario2.id === usuarios[j].id)
                                );

                                if (!existingMatch) {
                                    // Si no existe un match, agregarlo a la lista de nuevos matches
                                    newMatches.push({
                                        "porcentaje": compatibilidad.toFixed(2),
                                        "usuario1": {
                                            "id": usuarios[i].id,
                                            "nombre": usuarios[i].nombre
                                        },
                                        "usuario2": {
                                            "id": usuarios[j].id,
                                            "nombre": usuarios[j].nombre
                                        }
                                    });
                                }
                            }
                        }
                    }
                }
                // Agregar los nuevos matches a la base de datos
                for (const match of newMatches) {
                    try {
                        await db.collection("matches").add(match);
                    } catch (error) {
                        console.error("Error al agregar el documento a Firestore:", error);
                    }
                }
                res.status(200).send(newMatches)
            } catch (error) {
                console.error(error);
                res.status(500).send({ "message": "Error interno del servidor" });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ "message": "Error interno del servidor" });
    }
})



app.get('/compatibless', async (req, res) => {
    try {
        const token = req.header('Authorization');

        if (!token) {
            return res.status(401).send({ "message": "No token provided" });
        }

        jwt.verify(token, 'lemus', async (error, decoded) => {
            if (error) {
                return res.status(401).send({ "message": "Token no válido" });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ "message": "Internal Server Error" });
    }
    try {
        const querySnapshot = await db.collection("usuarios").get();
        const usuarios = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        let matches = []

        let categoriasIntereses = [];
        try {
            const queryIntereses = await db.collection("intereses").get();
            categoriasIntereses = queryIntereses.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
        } catch (error) {
            console.error(error);
        }

        categoriasIntereses = categoriasIntereses.map(categoria => categoria.nombre);

        for (let i = 0; i < usuarios.length; i++) {
            for (let j = 0; j < usuarios.length; j++) {
                if (i !== j) {
                    const compatibilidad = calcularCompatibilidad(usuarios[i], usuarios[j], categoriasIntereses);

                    if (compatibilidad > 0) {
                        matches.push({
                            "porcentaje": compatibilidad.toFixed(2),
                            "usuario1": {
                                "id": usuarios[i].id,
                                "nombre": usuarios[i].nombre
                            },
                            "usuario2": {
                                "id": usuarios[j].id,
                                "nombre": usuarios[j].nombre
                            }
                        });

                    }
                }
            }
        }
        for (const match of matches) {
            try {
                await db.collection("matches").add(match);
            } catch (error) {
                console.error("Error al agregar el documento a Firestore:", error);
            }
        }
        res.status(200).send(matches)
    } catch (error) {
        console.error(error);
    }
})

function calcularCompatibilidad(usuario1, usuario2, categoriasIntereses) {
    if (!usuario1.intereses || !usuario2.intereses) {
        // Si uno de los usuarios no tiene definidos los intereses, retornamos 0
        return 0;
    }


    if (usuario1.genero === "Masculino" && usuario2.genero === "Femenino") {
        const interesesComunes = calcularInteresesEnComun(usuario1, usuario2, categoriasIntereses);
        const totalInteresesUsuario1 = Object.values(usuario1.intereses).flat().length;
        const porcentajeCompatibilidad = (interesesComunes / totalInteresesUsuario1) * 100;

        if (
            usuario1.edad_min <= usuario2.edad && usuario2.edad <= usuario1.edad_max &&
            usuario2.edad_min <= usuario1.edad && usuario1.edad <= usuario2.edad_max
        ) {
            if (porcentajeCompatibilidad >= 70) {
                return porcentajeCompatibilidad; // Considerar factor de edad en el porcentaje de compatibilidad
            }
        }
    }

    return 0;
}


/* function calcularCompatibilidad(usuario1, usuario2) {
    if (usuario1.genero === "Masculino" && usuario2.genero === "Femenino") {
        const interesesComunes = calcularInteresesEnComun(usuario1, usuario2);
        const porcentajeCompatibilidad = (interesesComunes / usuario1.intereses.length) * 100;
        console.log(usuario1.intereses.length)
        const rangoEdad = Math.abs(usuario1.edad - usuario2.edad);
        const factorEdad = Math.max(1 - (rangoEdad / 10), 0);
        if (
            usuario1.edad_min <= usuario2.edad && usuario2.edad <= usuario1.edad_max &&
            usuario2.edad_min <= usuario1.edad && usuario1.edad <= usuario2.edad_max
        ) {
            if (porcentajeCompatibilidad >= 70) {
                return porcentajeCompatibilidad;
            }
        }
    }

    return 0;
} */

function calcularInteresesEnComun(usuario1, usuario2, categoriasIntereses) {
    if (!usuario1.intereses || !usuario2.intereses) {
        // Si uno de los usuarios no tiene definidos los intereses, retornamos 0
        return 0;
    }
    const interesesComunes = [];

    for (const categoria of categoriasIntereses) {
        const interesesComunesCategoria = usuario1.intereses[categoria].filter(interes => usuario2.intereses[categoria].includes(interes));
        interesesComunes.push(...interesesComunesCategoria);
    }

    return interesesComunes.length;

}


function calcularInteresesEnComun2(usuario1, usuario2) {
    if (!usuario1.intereses || !usuario2.intereses) {
        // Si uno de los usuarios no tiene definidos los intereses, retornamos 0
        return 0;
    }

    const interesesComunes = [];

    // Filtrar intereses de música comunes
    const musicaComun = usuario1.intereses.musica.filter(interes => usuario2.intereses.musica.includes(interes));
    //console.log(musicaComun)
    // Filtrar intereses de literatura comunes
    const literaturaComun = usuario1.intereses.literatura.filter(interes => usuario2.intereses.literatura.includes(interes));
    //console.log(literaturaComun)

    // Concatenar los intereses comunes de ambas categorías
    interesesComunes.push(...musicaComun, ...literaturaComun);

    return interesesComunes.length;
}


/* function calcularInteresesEnComun(usuario1, usuario2) {
    console.log(usuario1, usuario2)

    const interesesComunes = usuario1.intereses.filter(interes => usuario2.intereses.includes(interes));
    return interesesComunes.length;
} */

app.get('/matches/:id', async (req, res) => {
    try {
        // Consulta Firestore para encontrar el match en el campo "usuario1.id"
        const querySnapshotUsuario1 = await db.collection("matches")
            .where("usuario1.id", "==", req.params.id)
            .get();

        // Consulta Firestore para encontrar el match en el campo "usuario2.id"
        const querySnapshotUsuario2 = await db.collection("matches")
            .where("usuario2.id", "==", req.params.id)
            .get();

        // Obtener los matches que cumplan con la condición
        const matchesUsuario1 = querySnapshotUsuario1.docs.map(doc => doc.data());
        const matchesUsuario2 = querySnapshotUsuario2.docs.map(doc => doc.data());

        // Combinar los resultados de ambas consultas
        const matches = [...matchesUsuario1, ...matchesUsuario2];
        res.status(200).send(matches)
    } catch (error) {
        console.error(error);
    }
})

/* app.get('/matches/:id', async (req, res) => {
    try {
        const querySnapshot = await db.collection("matches").doc(req.params.id).get();
        res.status(200).send(querySnapshot.data())
    } catch (error) {
        console.error(error);
    }
}) */

// Evento de conexión de Socket.IO
io.on('connection', (socket) => {
    console.log('Usuario conectado');

    // Manejar evento 'sendMessage' cuando el cliente envía un mensaje
    socket.on('sendMessage', async (data) => {
        console.log('Nuevo mensaje recibido:', data);
        const sender = data.senderId
        const recipient = data.receiverId
        const text = data.message
        // Guardar el mensaje en Firestore
        try {
            // Realizar dos consultas para verificar si hay una conversación entre los usuarios
            const query1 = await db.collection('conversations')
                .where('participants', '==', [sender, recipient])
                .get();

            const query2 = await db.collection('conversations')
                .where('participants', '==', [recipient, sender])
                .get();

            let conversationId = null;

            // Verificar si alguna de las consultas devolvió una conversación existente
            if (!query1.empty) {
                conversationId = query1.docs[0].id;
            } else if (!query2.empty) {
                conversationId = query2.docs[0].id;
            } else {
                // Si no existe una conversación, crear una nueva
                const newConversationRef = await db.collection('conversations').add({
                    participants: [sender, recipient]
                });
                conversationId = newConversationRef.id;
            }

            // Agregar el mensaje a la subcolección de mensajes
            await db.collection('conversations').doc(conversationId).collection('messages').add({
                sender,
                text,
                timestamp: firebaseAdmin.firestore.FieldValue.serverTimestamp()
            });
            io.to(data.receiverId).emit('newMessage', data);
        } catch (error) {
            console.error('Error al guardar el mensaje en Firestore:', error);
        }
        /* try {
            await db.collection('chats').doc(`${data.senderId}-${data.receiverId}`).collection('messages').add({
                senderId: data.senderId,
                receiverId: data.receiverId,
                message: data.message,
                timestamp: new Date().getTime()
            });
            // Emitir el mensaje solo al usuario receptor
            io.to(data.receiverId).emit('newMessage', data);
        } catch (error) {
            console.error('Error al guardar el mensaje en Firestore:', error);
        } */
    });

    // Manejar evento 'loadConversation' cuando el cliente solicita cargar una conversación
    socket.on('loadConversation', async (data) => {
        const sender = data.senderId;
        const recipient = data.receiverId;

        try {
            // Realizar dos consultas para verificar si hay una conversación entre los usuarios
            const query1 = await db.collection('conversations')
                .where('participants', '==', [sender, recipient])
                .get();

            const query2 = await db.collection('conversations')
                .where('participants', '==', [recipient, sender])
                .get();

            let conversationId = null;

            // Verificar si alguna de las consultas devolvió una conversación existente
            if (!query1.empty) {
                conversationId = query1.docs[0].id;
            } else if (!query2.empty) {
                conversationId = query2.docs[0].id;
            }

            // Si se encontró una conversación, cargar todos los mensajes asociados
            if (conversationId) {
                const messagesQuery = await db.collection('conversations').doc(conversationId)
                    .collection('messages')
                    .orderBy('timestamp', 'asc')
                    .get();

                const messages = [];
                messagesQuery.forEach(doc => {
                    messages.push({
                        id: doc.id,
                        sender: doc.data().sender,
                        text: doc.data().text,
                        timestamp: doc.data().timestamp
                    });
                });

                // Emitir los mensajes al cliente que solicitó cargar la conversación
                socket.emit('conversationLoaded', { messages });
            }
        } catch (error) {
            console.error('Error al cargar la conversación desde Firestore:', error);
        }
    });

    // Evento de desconexión de Socket.IO
    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
    });
});


server.listen(3000, () => {
    console.log('listening on *:3000');
});

/* server.listen(3001, () => console.log(`listening on port 3001`)); */
/* app.listen(port, () => console.log(`Server has started on port: ${port}`)) */