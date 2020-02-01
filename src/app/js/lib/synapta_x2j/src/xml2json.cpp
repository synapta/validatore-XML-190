// xml2json.cpp : Defines the entry point for the console application.
//

#include "library.h"
#include <nan.h>
  using namespace std;
  using namespace Nan;
  using namespace v8;
void convert(const v8::FunctionCallbackInfo<v8::Value> & args)
{
	Isolate* isolate = args.GetIsolate();
  // wrap the string with v8's string type
  v8::String::Utf8Value val(args[0]->ToString());
  int lowercasetags = args[1]->BooleanValue();
  
  if(lowercasetags!=0)
    lowercasetags=1;
  // use it as a standard C++ string
  std::string str (*val);
	const char *cstr = str.c_str();
	char* res=xml2stringifiedJson(cstr, lowercasetags); 
  if(res==0)
  {
     isolate->ThrowException(v8::Exception::Error(v8::String::NewFromUtf8(isolate, "File does not exist")));
     return;
  }
	args.GetReturnValue().Set(String::NewFromUtf8(isolate, res)); 
}
void init(Handle <Object> exports, Handle<Object> module) 
{
	NODE_SET_METHOD(exports, "convert", convert);
}
// associates the module name with initialization logic
NODE_MODULE(synapta_x2j, init)  


