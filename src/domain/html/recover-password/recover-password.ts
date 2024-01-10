const dotenv = require('dotenv');
dotenv.config()
const fs = require('fs');
import path from 'path';

const recoverPasswordHtmlPath = path.join(__dirname, 'recover-password.html');
const recoverPasswordHtmlTemplate = fs.readFileSync(recoverPasswordHtmlPath, 'utf8')
  .replace('{PORT}', process.env.PORT);

export default recoverPasswordHtmlTemplate
