#pragma once
#define OK 0
#define FILE_ERR 1
#define FORMAT_ERR 2
#define ENDED_BEFORE_EXPECTED 3
#define TAG -1
#define CONTENT -2
#define CDATA -3
#define GOPARENT -4
#define GOPARENTWRONG -5
#define ARRAY -6
#define NULLNODE -7
#define NODE -8
#define INCOMPLETE -9
#define CONTINUE -10
char* xml2stringifiedJson(const char* filePath,int lowercasetags);
