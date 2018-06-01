/*
* Copyright (c) 2012-2017 "JUSPAY Technologies"
* JUSPAY Technologies Pvt. Ltd. [https://www.juspay.in]
*
* This file is part of JUSPAY Platform.
*
* JUSPAY Platform is free software: you can redistribute it and/or modify
* it for only educational purposes under the terms of the GNU Affero General
* Public License (GNU AGPL) as published by the Free Software Foundation,
* either version 3 of the License, or (at your option) any later version.
* For Enterprise/Commerical licenses, contact <info@juspay.in>.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  The end user will
* be liable for all damages without limitation, which is caused by the
* ABUSE of the LICENSED SOFTWARE and shall INDEMNIFY JUSPAY for such
* damages, claims, cost, including reasonable attorney fee claimed on Juspay.
* The end user has NO right to claim any indemnification based on its use
* of Licensed Software. See the GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with this program. If not, see <https://www.gnu.org/licenses/agpl.html>.
*/

"use strict";

var bodyParser = require("body-parser");
var xmlParser = require("xml2json");
var multiparty = require('multiparty');

var verifyFunction = function(req, res, buf, encoding) {
  //DO NOTHING
};

exports.setVerifyFunction = function(f) {
  var verifyFunction = f;
}

exports.jsonBodyParser = bodyParser.json({
  limit: "5mb",
  verify : verifyFunction
});

exports.urlDecoder = bodyParser.urlencoded({
  extended: false
});

var xmlOptions = {
  object: true,
  reversible: true,
  coerce: false,
  sanitize: false,
  trim: true,
  arrayNotation: false,
  alternateTextNode: false
};

exports.xmlBodyParser = function(req, res, next) {
  if (req.is("application/xml") || req.is("text/xml")) {
    var bodyStr = '';
    req.on("data", function(chunk) {
      bodyStr += chunk.toString();
    });
    req.on("end", function(chunk) {
      try {
        req.body = xmlParser.toJson(bodyStr, xmlOptions);
        next();
      } catch (err) {
        res.status(400).send({ status: "FAILURE", responseCode: 'XML_PARSING_ERROR', responseMessage: 'Failed while parsing XML Request' });
      }
    });
  } else {
    next();
  }
};

exports.mutipartBodyParser = function(options) {
  return function (req, res, next) {
    if(req.is("multipart/form-data")) {
      var form = new multiparty.Form(options);
      req.body = {};
      form.parse(req, function(err, fields, files) {
        if(err) {
          res.status(400).send({ status: "FAILURE", responseCode: 'MUTIPART_PARSING_ERROR', responseMessage: 'Failed while parsing Mutipart-Form-Data Request' });
        } else {
          try {
            var keys = Object.keys(fields);
            keys.map(function(key) { fields[key] = fields[key][0]});
            req.body = fields;
            next();
          } catch (error) {
            res.status(400).send({ status: "FAILURE", responseCode: 'MUTIPART_PARSING_ERROR', responseMessage: 'Failed while parsing Mutipart-Form-Data Request' });
          }
        }
      });
    } else {
      next();
    }
  }
}

exports.textBodyParser = bodyParser.text();
