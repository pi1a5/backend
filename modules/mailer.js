/* eslint-disable prefer-template */
/* eslint-disable no-undef */
/* eslint-disable no-tabs */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable linebreak-style */
/* eslint-disable class-methods-use-this */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable func-names */
/* eslint-disable no-console */

const nodemailer = require('nodemailer');
const { estagios } = require('../controllers/EstagioController');

class Mailer {
  async ticketSentNotification(orientadores) {
    try {
      console.log('entrou');
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'estagios.ifsp.notification@gmail.com',
          pass: 'arpldnvzcazxhntp',
        },
      });

      for (const j in orientadores) {
        const mailOptions = {
          from: 'estagios.ifsp.notification@gmail.com',
          to: j,
          subject: 'Teste de Aviso',
          html: `<style>
          body {
            font-family: Georgia, serif;
          }
          </style>
          <div style="border-style:solid;border-width: 2px;border-color:#3eae91;border-radius:8px;padding-top:40px; padding-left: 20px; padding-right: 20px; margin: 20%; background-color: 
          #fafafa
          ;" >
            <div style="text-align: center;">
              <h2 style="color: #3eae91;">Sistema de Estágios IFSP-SPO</h2>
                <hr>
             </div>
             <div style="text-align: center; padding-bottom: 50px; padding-top: 50px;">
                <p>Prezado ` + orientadores[j].nome + `,</p>
                <p>Você possui ` + orientadores[j].quantidade + ` ticket(s) pendente(s) de sua resposta no sistema, responda-os assim que possível.</p>	
                <p>Agradecemos.</p>
              </div>
               <footer style="text-align: center;">
                  <p style="font-size: 10px; color: #cccccc">Acesse o site em: <a href='https://pi1a5frontend-angular.herokuapp.com' style="color: #cccccc">https://pi1a5frontend-angular.herokuapp.com</p>
              </footer>
          </div>
              `,
        };

        transporter.sendMail(mailOptions, function (error, success) {
          if (error) {
            console.log(error);
          } else {
            console.log(success.response);
          }
        });
      }

      return { response: 'enviado com sucesso', status: 200 };
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao deletar orientador', status: 400 };
    }
  }
}

module.exports = new Mailer();
