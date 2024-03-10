const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const messagesFile = './messages.txt';

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Endpoint to handle sending messages
app.post('/send', (req, res) => {
    const { message, username } = req.body;

    if (!message || !username) {
        return res.status(400).send('No message or username provided');
    }

    fs.readFile(messagesFile, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error parsing existing messages');
        }

        let messages = [];
        if (data) {
            messages = JSON.parse(data).messages;
        }

        const newMessage = {
            id: messages.length + 1,
            username,
            message
        };

        messages.push(newMessage);

        fs.writeFile(messagesFile, JSON.stringify({ messages }), 'utf8', (err) => {
            if (err) {
                return res.status(500).send('Error saving message');
            }
            res.status(200).send('Message Sent');
        });
    });
});

// Endpoint to handle clearing messages
app.post('/clear', (req, res) => {
    fs.unlink(messagesFile, (err) => {
        if (err) {
            return res.status(500).send('Error clearing messages');
        }
        res.status(200).send('Messages Cleared');
    });
});

// Endpoint to retrieve messages
app.get('/messages', (req, res) => {
    fs.readFile(messagesFile, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading messages');
        }

        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(data);
    });
});

// Handle 404
app.use((req, res) => {
    res.status(404).send('Not Found');
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});