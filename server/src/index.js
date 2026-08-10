import {createApp} from "./app.js";
import {config} from "./config.js";

const app = createApp();

app.listen(config.port, () => {
  console.log(`Try-On Words API em http://localhost:${config.port}`);
  console.log(`Bucket: ${config.bucket} · Região: ${config.region} · Arquivo: ${config.key}`);
  console.log(config.apiToken ? "Auth: token exigido" : "Auth: aberta (sem API_TOKEN)");
  console.log(config.authUser && config.authPass ? "Login: exigido (Basic Auth)" : "Login: aberto (sem AUTH_USER/AUTH_PASS)");
});
