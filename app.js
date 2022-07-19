const debugInit = require('debug')('app:init');
const debugDB = require('debug')('app:db');
const express = require('express');
const config = require('config');
const morgan = require('morgan');
//const logging = require('./logging');
const Joi = require("joi");

const { StatusCodes } = require('http-status-codes');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
//Uso de un middleware de terceros
if (app.get('env') === 'development') {
    app.use(morgan('tiny'));
    debugInit('Morgan is available...');
}
// Trabajando con la base de datos
debugDB('Open conection whit database...');
// app.use(logging.log);
// app.use((request, response, next) => {
//     console.log('Authentication...');
//     next();
// })

const users = [
    { id: 1, document_type: 'CC', document_number: "1124044454", name: 'Luxardo R. Asis R.' },
    { id: 2, document_type: 'CC', document_number: "1049933179", name: 'Jenis Cervantes T.' },
    { id: 3, document_type: 'RC', document_number: "1124070335", name: 'Luxardo R. Asis C.' }
];

app.get('/', (_, response) => {
    response.send(`Application: ${config.get('app-name')}`);
});
app.get('/api/users', (_, response) => {
    response.status(StatusCodes.OK).json(users);
});
app.get('/api/users/:id', (request, response) => {
    let user = users.find(u => u.id === parseInt(request.params.id));

    if (!user)
        response.status(StatusCodes.NOT_FOUND).send('User not found.');

    response.status(StatusCodes.OK).json(user);
});
app.post('/api/users', (request, response) => {
    const schema = Joi.object({
        document_type: Joi.string().valid('CC', 'CE', 'TI', 'RC', 'PAS').required(),
        document_number: Joi.string().alphanum().max(10).required(),
        name: Joi.string().min(3).required()
    });

    const { error, value } = schema.validate(request.body);

    if (!error) {
        const user = {
            id: users.length + 1,
            document_type: value.document_type,
            document_number: value.document_number,
            name: value.name
        };

        users.push(user);

        response
            .status(StatusCodes.OK)
            .json(user);
    } else
        response.status(StatusCodes.BAD_REQUEST).send(error.details[0].message);
});
app.put('/api/users/:id', (request, response) => {
    let user = users.find(u => u.id === parseInt(request.params.id));

    if (!user) {
        response.status(StatusCodes.NOT_FOUND).send('User not found.');
        return;
    }

    const schema = Joi.object({
        document_type: Joi.string().valid('CC', 'CE', 'TI', 'RC', 'PAS').required(),
        document_number: Joi.string().alphanum().max(10).required(),
        name: Joi.string().min(3).required()
    });

    const { error, value } = schema.validate(request.body);

    if (error) {
        response.status(StatusCodes.BAD_REQUEST).send(error.details[0].message);
    }

    user.document_type = value.document_type;
    user.document_number = value.document_number;
    user.name = value.name;

    response.status(StatusCodes.OK).json(user);
});
app.delete('/api/users/:id', (request, response) => {
    let user = users.find(u => u.id === parseInt(request.params.id));

    if (!user) {
        response.status(StatusCodes.NOT_FOUND).send('User not found.');
        return;
    }

    users.splice(users.indexOf(user), 1);

    response.status(StatusCodes.NO_CONTENT).send();
});

app.listen(port, () => {
    console.log(`Application listened in port=[${port}]`);
})