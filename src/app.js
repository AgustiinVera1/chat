import express from "express";
import {engine} from 'express-handlebars';
import { __dirname } from "./utils.js";
import viewsRouter from './routes/views.router.js';
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import { Server } from "socket.io";
import { manager1 } from "./ProductManager.js";

const app = express();
//todo esto es para el entendimiento que le llega al servidor
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

//handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');

//routes
app.use('/api/views', viewsRouter);
app.use('/api/products', productsRouter);
app.use('api/carts',cartsRouter);

const httpServer = app.listen(8080, () => {
    console.log('Puerto 8080');
});

const socketServer = new Server(httpServer);
const messages = [];

socketServer.on('connection', (socket)=> {
	console.log('cliente conectado');
	try {
		socket.on('product', async (product)  => {
			await manager1.addProduct(product);
		})
	} catch (error) {
		return error;
	}
	try {
		socket.on('id', async (id)  => {
			await manager1.deleteProduct(+id);
		})
	} catch (error) {
		return error;
	}

	socket.on('newUser', (user)=>{
		socket.broadcast.emit('userConnected', user);
	});

	socket.on('message', (info)=>{
		messages.push(info);
		socketServer.emit('chat', messages); //socketServer para que todos lo vean
	});
});