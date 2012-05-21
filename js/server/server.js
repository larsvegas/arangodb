////////////////////////////////////////////////////////////////////////////////
/// @brief JavaScript server functions
///
/// @file
///
/// DISCLAIMER
///
/// Copyright 2011-2012 triagens GmbH, Cologne, Germany
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///     http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///
/// Copyright holder is triAGENS GmbH, Cologne, Germany
///
/// @author Dr. Frank Celler
/// @author Copyright 2011-2012, triAGENS GmbH, Cologne, Germany
////////////////////////////////////////////////////////////////////////////////

// -----------------------------------------------------------------------------
// --SECTION--                                                 Module "internal"
// -----------------------------------------------------------------------------

////////////////////////////////////////////////////////////////////////////////
/// @addtogroup V8ModuleInternal
/// @{
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
/// @brief internal module
////////////////////////////////////////////////////////////////////////////////

ModuleCache["/internal"].exports.db = db;
ModuleCache["/internal"].exports.edges = edges;
ModuleCache["/internal"].exports.ArangoCollection = ArangoCollection;
ModuleCache["/internal"].exports.ArangoEdgesCollection = ArangoEdgesCollection;

if (typeof SYS_DEFINE_ACTION === "undefined") {
  ModuleCache["/internal"].exports.defineAction = function() {
    console.error("SYS_DEFINE_ACTION not available");
  }
}
else {
  ModuleCache["/internal"].exports.defineAction = SYS_DEFINE_ACTION;
}

////////////////////////////////////////////////////////////////////////////////
/// @}
////////////////////////////////////////////////////////////////////////////////

// -----------------------------------------------------------------------------
// --SECTION--                                             Module "simple-query"
// -----------------------------------------------------------------------------

////////////////////////////////////////////////////////////////////////////////
/// @addtogroup V8ModuleSimpleQuery
/// @{
////////////////////////////////////////////////////////////////////////////////

try {
  require("simple-query");
}
catch (err) {
  console.error("while loading 'simple-query' module: %s", err);
}

////////////////////////////////////////////////////////////////////////////////
/// @}
////////////////////////////////////////////////////////////////////////////////

// -----------------------------------------------------------------------------
// --SECTION--                                                        ShapedJson
// -----------------------------------------------------------------------------

////////////////////////////////////////////////////////////////////////////////
/// @addtogroup V8Shell
/// @{
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
/// @brief prints a shaped json
////////////////////////////////////////////////////////////////////////////////

ShapedJson.prototype._PRINT = function(seen, path, names, level) {
  if (this instanceof ShapedJson) {
    PRINT_OBJECT(this, seen, path, names, level);
  }
  else {
    internal.output(this.toString());
  }
};

////////////////////////////////////////////////////////////////////////////////
/// @}
////////////////////////////////////////////////////////////////////////////////

// -----------------------------------------------------------------------------
// --SECTION--                                                      ArangoError
// -----------------------------------------------------------------------------

////////////////////////////////////////////////////////////////////////////////
/// @addtogroup V8Shell
/// @{
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
/// @brief prints an error
////////////////////////////////////////////////////////////////////////////////

ArangoError.prototype._PRINT = function() {
  var errorNum = this.errorNum;
  var errorMessage = this.errorMessage;

  internal.output("[ArangoError ", errorNum, ": ", errorMessage, "]");
};

////////////////////////////////////////////////////////////////////////////////
/// @brief converts error to string
////////////////////////////////////////////////////////////////////////////////

ArangoError.prototype.toString = function() {
  var errorNum = this.errorNum;
  var errorMessage = this.errorMessage;

  return "[ArangoError " + errorNum + ": " + errorMessage + "]";
};

////////////////////////////////////////////////////////////////////////////////
/// @}
////////////////////////////////////////////////////////////////////////////////

// -----------------------------------------------------------------------------
// --SECTION--                                                   ArangoDatabase
// -----------------------------------------------------------------------------

////////////////////////////////////////////////////////////////////////////////
/// @addtogroup V8Shell
/// @{
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
/// @brief drops a collection
///
/// @FUN{db._drop(@FA{collection})}
///
/// Drops a @FA{collection} and all its indexes.
///
/// @FUN{db._drop(@FA{collection-identifier})}
///
/// Drops a collection identified by @FA{collection-identifier} and all its
/// indexes. No error is thrown if there is no such collection.
///
/// @FUN{db._drop(@FA{collection-name})}
///
/// Drops a collection named @FA{collection-name} and all its indexes. No error
/// is thrown if there is no such collection.
///
/// @EXAMPLES
///
/// Drops a collection:
///
/// @verbinclude shell_collection-drop-db
///
/// Drops a collection identified by name:
///
/// @verbinclude shell_collection-drop-name-db
////////////////////////////////////////////////////////////////////////////////

ArangoDatabase.prototype._drop = function(name) {
  var collection = name;

  if (! (name instanceof ArangoCollection || name instanceof ArangoEdgesCollection)) {
    collection = internal.db._collection(name);
  }

  if (collection == null) {
    return;
  }

  return collection.drop()
};

ArangoEdges.prototype._drop = ArangoDatabase.prototype._drop;

////////////////////////////////////////////////////////////////////////////////
/// @brief truncates a collection
///
/// @FUN{db._truncate(@FA{collection})}
///
/// Truncates a @FA{collection}, removing all documents but keeping all its
/// indexes.
///
/// @FUN{db._truncate(@FA{collection-identifier})}
///
/// Truncates a collection identified by @FA{collection-identified}. No error is
/// thrown if there is no such collection.
///
/// @FUN{db._truncate(@FA{collection-name})}
///
/// Truncates a collection named @FA{collection-name}. No error is thrown if
/// there is no such collection.
///
/// @EXAMPLES
///
/// Truncates a collection:
///
/// @verbinclude shell_collection-truncate-db
///
/// Truncates a collection identified by name:
///
/// @verbinclude shell_collection-truncate-name-db
////////////////////////////////////////////////////////////////////////////////

ArangoDatabase.prototype._truncate = function(name) {
  var collection = name;

  if (! (name instanceof ArangoCollection || name instanceof ArangoEdgesCollection)) {
    collection = internal.db._collection(name);
  }

  if (collection == null) {
    return;
  }

  var all = collection.ALL(null, null).documents;

  for (var i = 0;  i < all.length;  ++i) {
    collection.remove(all[i]._id);
  }
};

ArangoEdges.prototype._truncate = ArangoDatabase.prototype._truncate;

////////////////////////////////////////////////////////////////////////////////
/// @brief finds an index
///
/// @FUN{db._index(@FA{index-handle})}
///
/// Returns the index with @FA{index-handle} or null if no such index exists.
///
/// @EXAMPLES
///
/// @verbinclude shell_index-read-db
////////////////////////////////////////////////////////////////////////////////

ArangoDatabase.prototype._index = function(id) {
  if (id.hasOwnProperty("id")) {
    id = id.id;
  }

  var re = /^([0-9]+)\/([0-9]+)/;
  var pa = re.exec(id);

  if (pa == null) {
    var err = new ArangoError();
    err.errorNum = internal.errors.ERROR_ARANGO_INDEX_HANDLE_BAD.code;
    err.errorMessage = internal.errors.ERROR_ARANGO_INDEX_HANDLE_BAD.message;
    throw err;
  }

  var col = this._collection(parseInt(pa[1]));

  if (col == null) {
    var err = new ArangoError();
    err.errorNum = internal.errors.ERROR_ARANGO_COLLECTION_NOT_FOUND.code;
    err.errorMessage = internal.errors.ERROR_ARANGO_COLLECTION_NOT_FOUND.message;
    throw err;
  }

  var indexes = col.getIndexes();

  for (var i = 0;  i < indexes.length;  ++i) {
    var index = indexes[i];

    if (index.id == id) {
      return index;
    }
  }

  return null;
};

ArangoEdges.prototype._index = ArangoDatabase.prototype._index;

////////////////////////////////////////////////////////////////////////////////
/// @brief drops an index
///
/// @FUN{db._dropIndex(@FA{index})}
///
/// Drops the @FA{index}.  If the index does not exists, then @LIT{false} is
/// returned. If the index existed and was dropped, then @LIT{true} is
/// returned. Note that you cannot drop the primary index.
///
/// @FUN{db._dropIndex(@FA{index-handle})}
///
/// Drops the index with @FA{index-handle}.
///
/// @EXAMPLES
///
/// @verbinclude shell_index-drop-index-db
////////////////////////////////////////////////////////////////////////////////

ArangoDatabase.prototype._dropIndex = function(id) {
  if (id.hasOwnProperty("id")) {
    id = id.id;
  }

  var re = /^([0-9]+)\/([0-9]+)/;
  var pa = re.exec(id);

  if (pa == null) {
    var err = new ArangoError();
    err.errorNum = internal.errors.ERROR_ARANGO_INDEX_HANDLE_BAD.code;
    err.errorMessage = internal.errors.ERROR_ARANGO_INDEX_HANDLE_BAD.message;
    throw err;
  }

  var col = this._collection(parseInt(pa[1]));

  if (col == null) {
    var err = new ArangoError();
    err.errorNum = internal.errors.ERROR_ARANGO_COLLECTION_NOT_FOUND.code;
    err.errorMessage = internal.errors.ERROR_ARANGO_COLLECTION_NOT_FOUND.message;
    throw err;
  }

  return col.dropIndex(id);
};

ArangoEdges.prototype._dropIndex = ArangoDatabase.prototype._dropIndex;

////////////////////////////////////////////////////////////////////////////////
/// @brief prints a database
////////////////////////////////////////////////////////////////////////////////

ArangoDatabase.prototype._PRINT = function(seen, path, names, level) {
  internal.output("[ArangoDatabase \"" + this._path + "\"]");
};

ArangoEdges.prototype._PRINT =  function(seen, path, names, level) {
  internal.output("[ArangoEdges \"" + this._path + "\"]");
};

////////////////////////////////////////////////////////////////////////////////
/// @brief strng representation of a database
////////////////////////////////////////////////////////////////////////////////

ArangoDatabase.prototype.toString = function(seen, path, names, level) {
  return "[ArangoDatabase \"" + this._path + "\"]";
};

ArangoEdges.prototype.toString = function(seen, path, names, level) {
  return "[ArangoEdges \"" + this._path + "\"]";
};

////////////////////////////////////////////////////////////////////////////////
/// @}
////////////////////////////////////////////////////////////////////////////////

// -----------------------------------------------------------------------------
// --SECTION--                                                 ArangoCollection
// -----------------------------------------------------------------------------

////////////////////////////////////////////////////////////////////////////////
/// @addtogroup V8Shell
/// @{
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
/// @brief collection is corrupted
////////////////////////////////////////////////////////////////////////////////

ArangoCollection.STATUS_CORRUPTED = 0;
ArangoEdgesCollection.STATUS_CORRUPTED = 0;

////////////////////////////////////////////////////////////////////////////////
/// @brief collection is new born
////////////////////////////////////////////////////////////////////////////////

ArangoCollection.STATUS_NEW_BORN = 1;
ArangoEdgesCollection.STATUS_NEW_BORN = 1;

////////////////////////////////////////////////////////////////////////////////
/// @brief collection is unloaded
////////////////////////////////////////////////////////////////////////////////

ArangoCollection.STATUS_UNLOADED = 2;
ArangoEdgesCollection.STATUS_UNLOADED = 2;

////////////////////////////////////////////////////////////////////////////////
/// @brief collection is loaded
////////////////////////////////////////////////////////////////////////////////

ArangoCollection.STATUS_LOADED = 3;
ArangoEdgesCollection.STATUS_LOADED = 3;

////////////////////////////////////////////////////////////////////////////////
/// @brief collection is unloading
////////////////////////////////////////////////////////////////////////////////

ArangoCollection.STATUS_UNLOADING = 4;
ArangoEdgesCollection.STATUS_UNLOADING = 4;

////////////////////////////////////////////////////////////////////////////////
/// @brief collection is deleted
////////////////////////////////////////////////////////////////////////////////

ArangoCollection.STATUS_DELETED = 5;
ArangoEdgesCollection.STATUS_DELETED = 5;

////////////////////////////////////////////////////////////////////////////////
/// @brief converts collection into an array
///
/// @FUN{@FA{collection}.toArray()}
///
/// Converts the collection into an array of documents. Never use this call
/// in a production environment.
////////////////////////////////////////////////////////////////////////////////

ArangoCollection.prototype.toArray = function() {
  return this.ALL(null, null).documents;
};

ArangoEdgesCollection.prototype.toArray = ArangoCollection.prototype.toArray;

////////////////////////////////////////////////////////////////////////////////
/// @brief truncates a collection
///
/// @FUN{@FA{collection}.truncate()}
///
/// Truncates a @FA{collection}, removing all documents but keeping all its
/// indexes.
///
/// @EXAMPLES
///
/// Truncates a collection:
///
/// @verbinclude shell_collection-truncate
////////////////////////////////////////////////////////////////////////////////

ArangoCollection.prototype.truncate = function() {
  return internal.db._truncate(this);
};

ArangoEdgesCollection.prototype.truncate = ArangoCollection.prototype.truncate;

////////////////////////////////////////////////////////////////////////////////
/// @brief finds an index of a collection
///
/// @FUN{@FA{collection}.index(@FA{index-handle})}
///
/// Returns the index with @FA{index-handle} or null if no such index exists.
///
/// @EXAMPLES
///
/// @verbinclude shell_index-read
////////////////////////////////////////////////////////////////////////////////

ArangoCollection.prototype.index = function(id) {
  var indexes = this.getIndexes();

  if (typeof id == "string") {
    var re = /^([0-9]+)\/([0-9]+)/;
    var pa = re.exec(id);

    if (pa == null) {
      id = this._id + "/" + id;
    }
  }
  else if (id.hasOwnProperty("id")) {
    id = id.id;
  }

  for (var i = 0;  i < indexes.length;  ++i) {
    var index = indexes[i];

    if (index.id == id) {
      return index;
    }
  }

  return null;
};

ArangoEdgesCollection.prototype.index = ArangoCollection.prototype.index;

////////////////////////////////////////////////////////////////////////////////
/// @brief prints a collection
////////////////////////////////////////////////////////////////////////////////

ArangoCollection.prototype._PRINT = function() {
  var status = "unknown";

  switch (this.status()) {
    case ArangoCollection.STATUS_NEW_BORN: status = "new born"; break;
    case ArangoCollection.STATUS_UNLOADED: status = "unloaded"; break;
    case ArangoCollection.STATUS_UNLOADING: status = "unloading"; break;
    case ArangoCollection.STATUS_LOADED: status = "loaded"; break;
    case ArangoCollection.STATUS_CORRUPTED: status = "corrupted"; break;
    case ArangoCollection.STATUS_DELETED: status = "deleted"; break;
  }
  
  SYS_OUTPUT("[ArangoCollection ", this._id, ", \"", this.name(), "\" (status ", status, ")]");
};

////////////////////////////////////////////////////////////////////////////////
/// @brief strng representation of a collection
////////////////////////////////////////////////////////////////////////////////

ArangoCollection.prototype.toString = function(seen, path, names, level) {
  return "[ArangoCollection " + this._id + "]";
};

////////////////////////////////////////////////////////////////////////////////
/// @}
////////////////////////////////////////////////////////////////////////////////

// -----------------------------------------------------------------------------
// --SECTION--                                            ArangoEdgesCollection
// -----------------------------------------------------------------------------

////////////////////////////////////////////////////////////////////////////////
/// @addtogroup V8Shell
/// @{
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
/// @brief prints a collection
////////////////////////////////////////////////////////////////////////////////

ArangoEdgesCollection.prototype._PRINT = function() {
  var status = "unknown";

  switch (this.status()) {
    case ArangoCollection.STATUS_NEW_BORN: status = "new born"; break;
    case ArangoCollection.STATUS_UNLOADED: status = "unloaded"; break;
    case ArangoCollection.STATUS_UNLOADING: status = "unloading"; break;
    case ArangoCollection.STATUS_LOADED: status = "loaded"; break;
    case ArangoCollection.STATUS_CORRUPTED: status = "corrupted"; break;
    case ArangoCollection.STATUS_DELETED: status = "deleted"; break;
  }
  
  SYS_OUTPUT("[ArangoEdgesCollection ", this._id, ", \"", this.name(), "\" (status ", status, ")]");
};

////////////////////////////////////////////////////////////////////////////////
/// @brief string representation of a collection
////////////////////////////////////////////////////////////////////////////////

ArangoCollection.prototype.toString = function(seen, path, names, level) {
  return "[ArangoEdgesCollection " + this._id + "]";
};

////////////////////////////////////////////////////////////////////////////////
/// @}
////////////////////////////////////////////////////////////////////////////////

// -----------------------------------------------------------------------------
// --SECTION--                                                  skip-list helper
// -----------------------------------------------------------------------------

////////////////////////////////////////////////////////////////////////////////
/// @addtogroup V8Shell
/// @{
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
/// @brief equal
////////////////////////////////////////////////////////////////////////////////

EQ = ModuleCache["/internal"].exports.EQ = function (value) {
  return [ [ "==", value ] ];
}

////////////////////////////////////////////////////////////////////////////////
/// @brief less than
////////////////////////////////////////////////////////////////////////////////

LT = ModuleCache["/internal"].exports.LT = function (value) {
  return [ [ "<", value ] ];
}

////////////////////////////////////////////////////////////////////////////////
/// @brief less than or equal
////////////////////////////////////////////////////////////////////////////////

LE = ModuleCache["/internal"].exports.LE = function (value) {
  return [ [ "<=", value ] ];
}

////////////////////////////////////////////////////////////////////////////////
/// @brief greater than
////////////////////////////////////////////////////////////////////////////////

GT = ModuleCache["/internal"].exports.GT = function (value) {
  return [ [ ">", value ] ];
}

////////////////////////////////////////////////////////////////////////////////
/// @brief greater than or equal
////////////////////////////////////////////////////////////////////////////////

GE = ModuleCache["/internal"].exports.GE = function (value) {
  return [ [ ">=", value ] ];
}

////////////////////////////////////////////////////////////////////////////////
/// @brief range (left closed, right open)
////////////////////////////////////////////////////////////////////////////////

RANGE = ModuleCache["/internal"].exports.RANGE = function (left, right) {
  return [ [ ">=", left ], [ "<", right ] ];
}

////////////////////////////////////////////////////////////////////////////////
/// @brief open range
////////////////////////////////////////////////////////////////////////////////

ORANGE = ModuleCache["/internal"].exports.ORANGE = function (left, right) {
  return [ [ ">", left ], [ "<", right ] ];
}

////////////////////////////////////////////////////////////////////////////////
/// @brief closed range
////////////////////////////////////////////////////////////////////////////////

CRANGE = ModuleCache["/internal"].exports.CRANGE = function (left, right) {
  return [ [ ">=", left ], [ "<=", right ] ];
}

////////////////////////////////////////////////////////////////////////////////
/// @}
////////////////////////////////////////////////////////////////////////////////

// Local Variables:
// mode: outline-minor
// outline-regexp: "^\\(/// @brief\\|/// @addtogroup\\|// --SECTION--\\|/// @page\\|/// @}\\)"
// End:
