# Custom REST Templater for NodeJS

Simple module for generating custom but uniform responses for REST Requests for NodeJS
for avoiding the need to repeat the status code in all the response across the project

## 1. Installation

Using npm:

```bash
$ npm install custom-rest-templater
```

## 2. Configuration

```javascript
var customRestTemplater = require('custom-rest-templater');
// all *Status* properties should be a valid Http Status code
customRestTemplater.options(Object);
```

The options method receives an object with the following properties (all are optional):

|Property|Type|Default Value|Description|
|---|---|---|---|
|defaultStatusSuccess|Integer|200|Status code for a successful response|
|defaultStatusFailure|Integer|400|Status code for a non successful response|
|getShouldHaveBody|Boolean|true|Review if the object sent is empty for generating a successful response for a GET request|
|getStatusSuccess|Integer|200|Status code for a successful response for a GET request|
|getStatusFailure|Integer|404|Status code for a non successful response for a GET request|
|postShouldHaveBody|Boolean|true|Review if the object sent is empty for generating a successful response for a POST request|
|postStatusSuccess|Integer|201|Status code for a successful response for a POST request|
|postStatusFailure|Integer|400|Status code for a non successful response for a POST request|
|putShouldHaveBody|Boolean|true|Review if the object sent is empty for generating a successful response for a PUT request|
|putStatusSuccess|Integer|200|Status code for a successful response for a PUT request|
|putStatusFailure|Integer|400|Status code for a non successful response for a PUT request|
|patchShouldHaveBody|Boolean|true|Review if the object sent is empty for generating a successful response for a PATCH request|
|patchStatusSuccess|Integer|200|Status code for a successful response for a PATCH request|
|patchStatusFailure|Integer|400|Status code for a non successful response for a PATCH request|
|deleteShouldHaveBody|Boolean|true|Review if the object sent is empty for generating a successful response for a DELETE request|
|deleteStatusSuccess|Integer|200|Status code for a successful response for a DELETE request|
|deleteStatusFailure|Integer|400|Status code for a non successful response for a DELETE request|
|template|Function|null|Callback for generating the response body, if not set then it sends the ```object``` used in the ```customRest/customRestSuccess/customRestFailure``` method|

The template function receives three arguments:

|Property|Type|Description|
|---|---|---|
|object|Object|The object that is been sent as the response body|
|defaultData|Object|An object with **status** and **message** properties corresponding to the **HTTP Status Code** and its **Description**|
|responseArgs|Object|Additional arguments sent as the second parameter on the **customRest** method|

It should return an object for the response body and it can have any format.

### Example

```javascript
var customRestTemplater = require('custom-rest-templater');
customRestTemplater.options({
  patchShouldHaveBody: false, // patch method may not have a body for a successful response
  putShouldHaveBody: false, // put method may not have a body for a successful response
  deleteShouldHaveBody: false, // delete method may not have a body for a successful response
  template: (object, defaultData, responseArgs) => {
    return {
      data: object,
      additionalData: responseArgs
    };
  }
});
```

## 3. Methods added to the Response Object

|Method|Description|
|---|---|
|customRest|creates the response and tests if the object is empty for sending a successful or not status code|
|customRestSuccess|creates the response and sends a successful status code|
|customRestSuccess|creates the response and sends a non successful status code|

All the methods have the following parameters

|Parameter|Type|Default Value|Required|Description|
|---|---|---|---|---|
|responseBody|Object|null|true|The object to be sent as the response body (the one to be tested if is empty)|
|responseArgs|Object|{}|false|Additional params to be sent in the response, here we could modify the response status code by sending a custom **status** key|

## 4. Usage Examples

Sample template using the defaultData sent
```javascript
var customRestTemplater = require('custom-rest-templater');
customRestTemplater.options({
  template: (object, defaultData, responseArgs) => {
    return {
      data: defaultData.status < 400 ? object : null,
      success: defaultData.status < 400,
      message: responseArgs.hasOwnProperty('message') ?
               responseArgs.message :
               defaultData.message
    };
  }
});
```

**GET Request**

If a non empty object is sent
```javascript
res.customRest({name: 'myName'});
```
_Response_
```
status: 200
body: {"data":{"name":"myName"},"success":true,"message":"Ok"}
```

If an empty object or "nothing" is sent
```javascript
res.customRest({});
```
_Response_
```
status: 404
body: {"data":{},"success":false,"message":"Not found"}
```

**POST Request**

If a non empty object is sent
```javascript
res.customRest({name: 'myName'});
```
_Response_
```
status: 201
body: {"data":{"name":"myName"},"success":true,"message":"Created"}
```

If an empty object or "nothing" is sent
```javascript
res.customRest({});
```
_Response_
```
status: 400
body: {"data":{},"success":false,"message":"Bad request"}
```

**PUT, PATCH, DELETE Request**

If a non empty object is sent
```javascript
res.customRest({name: 'myName'});
```
_Response_
```
status: 200
body: {"data":{"name":"myName"},"success":true,"message":"Ok"}
```

If an empty object or "nothing" is sent
```javascript
res.customRest({});
```
_Response_
```
status: 400
body: {"data":{},"success":false,"message":"Bad request"}
```

**Custom status sent**

If a non empty object is sent
```javascript
res.customRest({name: 'myName'}, {status: 202});
```
_Response_
```
status: 202
body: {"data":{"name":"myName"},"success":true,"message":"Accepted"}
```

**Successful Response on empty object for a GET Request**

If a non empty object is sent
```javascript
res.customRestSuccess({});
```
_Response_
```
status: 200
body: {"data":{},"success":true,"message":"Ok"}
```

**Non Successful Response on non empty object for a GET Request**

If a non empty object is sent
```javascript
res.customRestFailure({name: 'myName'});
```
_Response_
```
status: 404
body: {"data":null,"success":true,"message":"Not Found"}
```
Here data is sent as null because of the template function

**Non Successful Response on non empty object for a GET Request with custom status**

If a non empty object is sent
```javascript
res.customRestFailure({name: 'myName'}, {status: 400});
```
_Response_
```
status: 400
body: {"data":null,"success":true,"message":"Bad request"}
```
Here data is sent as null because of the template function

## 5. Contact

You can contact me at [felix.carreno@gmail.com](mailto:felix.carreno@gmail.com)
