exports.unauthorizedResponse = (res, message) => {
    var data = {
        status: false,
        message
    }
    return res.status(200).json(data);
}
exports.forbiddenResponse = (res, message, data) => {
    var data = {
        status: false,
        message,
        data
    }
    return res.status(200).json(data)
}
exports.accessTokenExpired = (res, message, data) => {
    var data = {
        status: false,
        message,
        data
    }
    return res.status(401).json(data);
}
exports.internalServerError = (res, message, data) => {
    var data = {
        status: false,
        message,
        data
    }
    return res.status(500).json(data);
}
exports.validationErrorWithData = (res, message, data) => {
    var data = {
        status: false,
        message,
        data
    }
    return res.status(200).json(data)
}

exports.GenerateActionObject = (type, payload) => {
    const actionObject = {
        type,
        payload
    }
    return actionObject
}


/**
 * 200-Ok=========>The request was successfully completed.
 * 201-Created=====>A new resource was successfully created.
 * 400-Bad request====>The request was invalid.
 * 401-UnAuthorized====>The request did not include an authentication token or the authentication token was expired.
 * 403-Forbidden====>The client did not have permission to access the requested resource.
 * 404-Not found====>The requested resource was not found.
 * 405-Method not allowed====>The HTTP method in the request was not supported by the resource. For example, the DELETE method cannot be used with the Agent API.
 * 409-Conflict====>The request could not be completed due to a conflict. For example,  POST ContentStore Folder API cannot complete if the given file or folder name already exists in the parent location.
 * 422-Schema error====>Incoming request error like email is invalid
 * 500-Internal Server Error====>The request was not completed due to an internal error on the server side.
 * 503-Service Unavailable====>The server was unavailable.
 */