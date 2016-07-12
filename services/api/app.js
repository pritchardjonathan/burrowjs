const Koa = require("koa");
const route = require("koa-route");
const koaJwt = require("koa-jwt");

const app = new Koa();
const db = require("promised-mongo")("sovote");
require("./ensure-mongodb-indexes")(db);

app.use(require("koa-bodyparser")());

// Unauthenticated
app.use(route.post('/api/user', require("./handlers/create-user")(db)));
app.use(route.get('/api/authentication', require("./handlers/get-authentication")(db)));
app.use(route.get("/api/uk-parliament-qa", require("./handlers/get-qa")()));

app.use(koaJwt({ secret: process.env.JWT_SECRET }));

// Authenticated
app.use(route.get('/api/user', require("./handlers/get-user")(db)));
app.use(route.delete('/api/user/:id', require("./handlers/delete-user")(db)));
app.use(route.post('/api/user/:id', require("./handlers/update-user")(db)));

app.use(route.get('/api/comment', require("./handlers/get-comments")(db)));
app.use(route.post('/api/comment', require("./handlers/post-comment")(db)));

app.listen(5000);

console.log("listening on port 5000");