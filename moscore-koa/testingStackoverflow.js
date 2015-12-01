//http://stackoverflow.com/a/23402492/356218
function controlFlow(genFunc){
  // check to make sure we have a generator function otherwise explode

  var generator; // reference for an initialized generator

  // return a funcion so that execution time can be postponed
  return function(){
    runGen(genFunc());
  }

  function runGen(generator){
    var ret = generator.next();

    // here the generator is already finished we we'll return the final value
    if(ret.done){
      console.log("VALUE: " + ret.value)
      return ret.value
    }

    // here we'll handle the yielded value no matter what type it is
    // I'm being naive here for examples sake don't do this
    if(typeof ret.value === 'function'){
      // oh look we have a regular function (very faulty logic)
      // we wouldn't do this either but yeah
      ret.value(function(err, result){
        console.log("BAD: " + result);
      });
    }

   // oh we got another item like an array or object that means parallelism or serialization depending on what we got back
   // turn array, object, whatever into callback mechanisms and then track their completion
   // we're just going to fake it here and just handle the next call
   runGen(generator);
  }
}

function thunked(callback){
  return function(){
    callback(null, 5);
  };
};

function regular(callback){
  console.log('regular function call');
  callback(null, 'value');
};

controlFlow(function *(){
  yield thunked(function(err, result){
    console.log(err);
    console.log(result);
  });
  yield regular;
  yield thunked(function(err, result){
    console.log('Another Thunked');
  });
  yield regular(function(err, result){
    console.log(err);
    console.log(result);
  });
})();