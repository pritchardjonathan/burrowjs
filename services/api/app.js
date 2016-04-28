const Koa = require("koa");
const route = require("koa-route");
const koaJwt = require("koa-jwt");

const app = new Koa();
const db = require("promised-mongo")("sovote");

app.use(require("koa-bodyparser")());

// Unauthenticated
app.use(route.post('/api/user', require("./handlers/post-user")(db)));
app.use(route.get('/api/authentication', require("./handlers/get-authentication")(db)));

app.use(koaJwt({ secret: process.env.JWT_SECRET }));

// Authenticated
app.use(route.get('/api/user', require("./handlers/get-user")(db)));

app.listen(5000);

console.log("listening on port 5000");