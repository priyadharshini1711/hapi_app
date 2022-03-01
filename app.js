'use strict';

const Hapi = require('@hapi/hapi');
const Path = require('path');
const Vision = require('@hapi/vision');
const Handlebars = require('handlebars');
const MySQL = require('mysql');

const connection = MySQL.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'hapi'
});



const rootHandler = (request, reply) => {
    return reply.view('index', {
        title: 'views | hapi ' + request.server.version,
        message: 'Hello Handlebars!',
        name: 'sample'
    });
};


const init = async () => {

    const server = Hapi.server({
        port: 3000,
        host: 'localhost',
        routes: {
            files: {
                relativeTo: Path.join(__dirname, 'public')
            }
        }
    });

    connection.connect()

    server.route({
        method: 'GET',
        path: '/db/users/',
        handler: async function (request, reply) {

            return new Promise ((resolve, reject)=> {

                connection.query('SELECT id,name from people', function (error, results, fields) {
                     if (error) throw error;

                     return resolve(results)
                   });


            })

        }
    });
    

    server.route({
        method: 'GET',
        path: '/',
        handler: (request, reply) => { 
            return 'Hello World'
        }
    })

    server.route({
        method: 'GET',
        path: '/user/{name}',
        handler: (request, reply) => { 
            return 'Hello ' + request.params.name
        }
    })

    await server.register(require('@hapi/inert'));

    server.route({
        method: 'GET',
        path: '/about',
        handler: function (request, h) {
            return h.file('about.html');
        }
    });

    server.route({
        method: 'GET',
        path: '/image',
        handler: function (request, h) {
            return h.file('hapi.png');
        }
    });

    await server.register(Vision);

    server.views({
        engines: { html: Handlebars },
        relativeTo: __dirname,
        path: 'views'
    });

    server.route({ 
        method: 'GET', 
        path: '/tasks', 
        handler: (request, reply) => {
            return reply.view('tasks', {
                tasks: [
                    {text: "Task One"},
                    {text: "Task Two"},
                    {text: "Task Three"}
                ]
            });
        } 
    });

    server.route({ 
        method: 'GET', 
        path: '/db/tasks/', 
        handler: (request, reply) => {
            return new Promise ((resolve, reject)=> {
                connection.query('SELECT text from tasks', function (error, results, fields) {
                    if (error) throw error;
                    //  console.log(results)
                    return reply.view('tasks',{
                         tasks: {}
                     })
                });
            })

            // return reply.view('tasks', {
            //     tasks: [
            //         {text: "Task One"},
            //         {text: "Task Two"},
            //         {text: "Task Three"}
            //     ]
            // });
        } 
    });

    server.route({ 
        method: 'GET', 
        path: '/views', 
        handler: rootHandler 
    });


    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();