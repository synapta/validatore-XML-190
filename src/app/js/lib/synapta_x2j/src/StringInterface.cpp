#include <string.h>
#include "StringInterface.h"

struct StringInterface si;
SI si_init()
{
	si.writingAt = 0;
	return &si;
}
void si_appendChar(SI si, char curchar) {
	si->BUFFER[si->writingAt] = curchar;
	si->writingAt++;
}
char* si_getChars(SI si)
{
	return si->BUFFER;
}
char si_getLastChar(SI si)
{
	return si->BUFFER[si->writingAt - 1];
}
int si_getCurPos(SI si)
{
	return si->writingAt;
}
void si_rewind(SI si, int pos)
{
	si->writingAt -= pos;
}
void si_appendString(SI si, const char* toAppend, char terminator)
{
	int i = 0;
	while (toAppend[i] != terminator)
	{
		si_appendChar(si, toAppend[i]);
		i++;
	}
}
void si_setPos(SI si, int newpos)
{
	si->writingAt = newpos;
}
void si_writeCharAt(SI si, char toWrite, int pos)
{
	si->BUFFER[pos] = toWrite;
}
void si_insertStringAt(SI si, const char* toWrite, int pos)
{
	int shift = strlen(toWrite);
	int oldWrAt = si->writingAt;
	while (si->writingAt >= pos)
	{
		si->BUFFER[si->writingAt+shift] = si->BUFFER[si->writingAt];
		si->writingAt--;
	}
	si->writingAt =oldWrAt+shift;
	shift = 0;
	while (toWrite[shift] != '\0')
	{
		si->BUFFER[pos + shift] = toWrite[shift];
		shift++;
	}

}