#pragma once
#define BUFSIZE 40*1024*1024
struct StringInterface {
	char BUFFER[BUFSIZE];
	int writingAt;
};
typedef StringInterface* SI;
SI si_init();
void si_appendChar(SI si, char curchar);
char* si_getChars(SI si);
char si_getLastChar(SI si);
int si_getCurPos(SI si);
void si_rewind(SI si, int pos);
void si_appendString(SI si, const char* toAppend,char terminator);
void si_setPos(SI si, int newpos);
void si_writeCharAt(SI si, char toWrite, int pos);
void si_insertStringAt(SI si, const char* toWrite, int pos);