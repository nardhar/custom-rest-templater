var codes = require('builtin-status-codes');

// default static options
var staticOptions = {
  defaultStatusSuccess: 200,
  defaultStatusFailure: 400,

  getShouldHaveBody: true,
  getStatusSuccess: 200,
  getStatusFailure: 404,

  postShouldHaveBody: true,
  postStatusSuccess: 201,
  postStatusFailure: 400,

  putShouldHaveBody: true,
  putStatusSuccess: 200,
  putStatusFailure: 400,

  patchShouldHaveBody: true,
  patchStatusSuccess: 200,
  patchStatusFailure: 400,

  deleteShouldHaveBody: true,
  deleteStatusSuccess: 200,
  deleteStatusFailure: 400
};

function customRestTemplater(req, res, next) {
  /**
   * adding customRest method with two arguments
   * @param Object object: the object to be rendered as final data, if null should be send, then input {}
   * @param Object responseArgs: the response arguments in case it should not be
   @ @return Response: Response formatted with the buildResponse method
   */
  res.customRest = function(object, responseArgs = {}) {
    // checks if response is successful by reviewing the staticOptions configuration and if the
    // object sent is treated as empty
    let successful = !staticOptions[req.method.toLowerCase() + 'ShouldHaveBody'] || !isEmpty(object)
    return buildResponse(res, req.method, successful, object, responseArgs);
  };

  res.customRestSuccess = function(object, responseArgs = {}) {
    return buildResponse(res, req.method, true, object, responseArgs);
  };

  res.customRestFailure = function(object, responseArgs = {}) {
    return buildResponse(res, req.method, false, object, responseArgs);
  };

  next();
};

/**
 * Finds the response status according to the method required and if it is successful or not
 * @param String method: Http method
 * @param Boolean successful: If the response is a success or a failure
 * @return Integer: The status to be sent in the response
 */
function findStatus(method, successful) {
  let successfulValue = successful ? 'Success' : 'Failure';
  let statusKey = method.toLowerCase() + 'Status' + successfulValue;
  // check if staticOptions does not have statusKey key, otherwise returns a default status code
  return staticOptions.hasOwnProperty(statusKey) ? staticOptions[statusKey] :
         staticOptions['defaultStatus' + successfulValue];
}

/**
 * Response builder with the template function from staticOptions
 * if no template function is sent then the object is sent without transforming
 * @param Object object: The object to be rendered as JSON
 * @param Integer status: The HTTP status codes
 * @param Object responseArgs: Additional response arguments
 * @return Object: The object to be sent as the response body
 */
function buildResponse(res, method, successful, object, responseArgs = {}) {
  // inferes or sets the response status
  // a custom status could be sent in responseArgs
  let status = responseArgs.hasOwnProperty('status') ? responseArgs.status :
               // testing with the req.method param for generating the corresponding status code
               findStatus(method, successful);
  // builds the response body
  let jsonBody = staticOptions.hasOwnProperty('template') ?
                 staticOptions.template(object, {
                   status: status,
                   message: codes[status]
                 }, responseArgs) :
                 object;
  // builds the corresponding data response as JSON
  return res.status(status).json(jsonBody);
}

/**
 * Function for checking if an object is empty
 * An empty array is not treated as empty
 * @param Object obj: object for reviewing if should be empty
 * @return Boolean: if the object is treated as empty or not
 */
function isEmpty(obj) {
  if (obj == null || typeof obj !== 'object') {
    return true;
  }

  // if obj is an Array then it does not matter if it has elements or not
  if (obj instanceof Array) {
    return false;
  }

  // checks that every key in the object exists as a key
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false;
    }
  }

  return true;
};

/**
 * Function for merging properties of two objects
 * @param Object obj1: Original object
 * @param Object obj2: Merging object
 * @return Object: Merged Object
 */
function mergeOptions(obj1, obj2) {
    var obj3 = {};
    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
    return obj3;
};

customRestTemplater.options = function(options) {
	if (typeof options === 'object'){
		staticOptions = mergeOptions(staticOptions, options);
	}
};

module.exports = customRestTemplater;
