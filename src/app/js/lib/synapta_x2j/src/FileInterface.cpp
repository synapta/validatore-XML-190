#include "FileInterface.h"
#include <stdio.h>
#define BUFSIZE2 40*1024*1024
unsigned char BUFFER2[BUFSIZE2];
struct FileInterface fi;
FI fi_init(const char* path)
{
	FILE* fp = fopen(path, "rb");
	if (fp == 0)
		return (FI)0;
	fi.at = 0;
	fi.FILECONTENT = BUFFER2;
	fi.FLENGHT=fread(fi.FILECONTENT, 1, BUFSIZE2, fp);
	//check feof e ferror
	fclose(fp);
	fi.FILECONTENT[fi.FLENGHT] = '\0';
	return &fi;
}
void fi_destroy()
{

}
void fi_skip(FI fileint, int skip)
{
	fileint->at += skip;
}
int fi_getchar(FI fileint)
{
	if (fileint->at >= fileint->FLENGHT)
		return -1;
	fileint->at++;
	return fileint->FILECONTENT[fileint->at - 1];
}
void fi_rewind(FI fileint, int rewind)
{
	fileint->at -= rewind;
}
int fi_test(FI fileint, const char* test)
{
	int testindex=0;
	int stringindex = fileint->at;
	while (1)
	{
		if (test[testindex] == '\0' || stringindex >= fileint->FLENGHT || test[testindex] != fileint->FILECONTENT[stringindex])
			break;
		testindex++;
		stringindex++;
	}
	return test[testindex] == '\0';
}
int fi_over(FI fileint)
{
	return fileint->at >= fileint->FLENGHT;
}
int fi_getAbsolutePosition(FI fileint)//nel caso si implementi un buffer circolare, non sara' piu' l'at attuale ma l'effettivo numero di byte letti
{
	return fileint->at;
}