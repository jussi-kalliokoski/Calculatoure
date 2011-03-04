(function(global){

var	Object		= global.Object;

// This polyfill is courtesy of Microsoft / Allen Wirfs-Brock.
if (Object.prototype.__defineGetter__ && !Object.defineProperty){
	Object.defineProperty = function(obj, prop, desc){
		if (desc.get){
			obj.__defineGetter__(prop, desc.get);
		}
		if (desc.set){
			obj.__defineSetter__(prop, desc.set);
		}
	};
}

}(this));
