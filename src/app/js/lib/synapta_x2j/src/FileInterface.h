#pragma once
struct FileInterface {
	unsigned char* FILECONTENT;
	int FLENGHT;
	int at;
};
typedef struct FileInterface* FI;
FI fi_init(const char* path);
void fi_destroy();
void fi_skip(FI fileint, int skip);
int fi_getchar(FI fileint);
void fi_rewind(FI fileint, int rewind);
int fi_test(FI fileint, const char* test);
int fi_over(FI fileint);
int fi_getAbsolutePosition(FI fileint);
