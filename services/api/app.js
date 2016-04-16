const Koa = require("koa");
const route = require("koa-route");

const app = new Koa();

const db = require("promised-mongo")("sovote");

app.use(route.get('/user', require("./handlers/get-user")(db)));

app.listen(5000);