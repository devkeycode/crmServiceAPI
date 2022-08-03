//This file contains the logic(at central place) to connect to the notification service.here we are making rest api calls from crmService to the notificationService(programatically,from one server to another server),with the help of a library called node-rest-client.

const Client = require("node-rest-client").Client;
const { Notification_Service_URI } = require("../configs/server.config");

const client = new Client(); //client object ,will be used for calling rest apis

const sendNotificationReq = (subject, recipients, content, requester) => {
  //create the request body
  const requestBody = {
    subject: subject,
    recipientEmails: recipients,
    content: content,
    requester: requester,
  };
  //prepare the headers
  const requestHeaders = {
    "Content-Type": "application/json",
  };
  //combine headers and request body together
  const args = {
    data: requestBody,
    headers: requestHeaders,
  };
  //make a POST call and handle the response
  try {
    client.post(Notification_Service_URI, args, (data, response) => {
      console.log("Request sent successfully");
      console.log(data); //data is actual data which sended along with response
      //extract notificationrequest tracking id from here

      // console.log(response);//a big object,having all the data related to response
    });
  } catch (error) {
    console.error(error.message);
  }
};

module.exports = {
  sendNotificationReq,
};
