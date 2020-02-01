#include <stdio.h>
#include <string.h>
#include "library.h"
#include "FileInterface.h"
#include "StringInterface.h"

#define TAGLEN 60				//massima lunghezza di un tag	
#define ONLY_ONE_ROOT 1			//terminato il primo tag al livello 0, ritorna e salta i successivi (XML compliant: sarebbe permesso un solo tag root)
#define SAVE_LEVEL 1			//Trovato un nodo incompleto, questo livello e' il primo salvo, ovvero non avviene il rewind al suo inizio, e i suoi figli precedenti vengono mantenuti, viene solo ignorato l'ultimo figlio, quello incompleto.
#define ALLOW_TEXT_AFTER_ARRAY 0//Se subito dopo un ARRAY trovi un testo volante, ignoralo e non inserirlo in un tag #text
int lowercaseTags = 1;
int my_strcpy(char* dest, const char* src,char terminator)
{
	int i = 0;
	while (src[i] != terminator)
	{
		dest[i] = src[i];
		i++;
	}
	return i;
}

//salta gli spazi e la spazzatura iniziale fra un tag e l'altro fino al quando non si prospetta un contenuto. Restituisci il tipo del contenuto trovato: TAG, CDATA, CONTENT o ENDED_BEFORE_EXPECTED. Salta commenti, tag meta.
int SkipFluff(FI fileint)
{
	int curchar;
	while (!fi_over(fileint))
	{
		do
		{
			curchar = fi_getchar(fileint);
		} while ((curchar>='\b'&&curchar<='\r') || curchar == ' '||(curchar>0&&(curchar<32||curchar>127)&&fi_getAbsolutePosition(fileint)<=5));//alcuni editor aggiungono caratteri sporchi all'inizio del file
		if (curchar > 32)
		{
			if (curchar == '<')
			{
				if (fi_test(fileint, "!--\0"))//comment
				{
					fi_skip(fileint,3);
					while (!fi_over(fileint) && !fi_test(fileint, "-->\0"))
						fi_skip(fileint,1);
					if (fi_over(fileint))
						return ENDED_BEFORE_EXPECTED;
					else
					{
						fi_skip(fileint, 3);
						continue;
					}
				}
				else if (fi_test(fileint, "?\0"))//meta
				{
					fi_skip(fileint, 1);
					while (!fi_over(fileint) && !fi_test(fileint, "?>\0"))
						fi_skip(fileint,1);
					if (fi_over(fileint))
						return ENDED_BEFORE_EXPECTED;
					else
					{
						fi_skip(fileint, 2);
						continue;
					}
				}
				else if (fi_test(fileint, "![CDATA[\0"))//cdata
				{
					fi_skip(fileint,8);
					return CDATA;
				}
				else if (fi_test(fileint, "!\0"))//meta
				{
					fi_skip(fileint, 1);
					while (!fi_over(fileint) && !fi_test(fileint, ">\0"))
						fi_skip(fileint, 1);
					if (fi_over(fileint))
						return ENDED_BEFORE_EXPECTED;
					else
					{
						fi_skip(fileint, 1);
						continue;
					}
				}
				else if (fi_test(fileint, "/\0"))
				{
					fi_skip(fileint, 1);
					return GOPARENT;
				}
				else//tag
				{
					return TAG;
				}
			}
			else
			{
				fi_rewind(fileint, 1);
				return CONTENT;
			}
		}
		else if (curchar == -1)
			return ENDED_BEFORE_EXPECTED;
		else
			return FORMAT_ERR;
	}
	return ENDED_BEFORE_EXPECTED;
}
int tolowercase(int curchar)
{
	if (curchar >= 'A'&&curchar <= 'Z')
		curchar = curchar - 'A' + 'a';
	return curchar;
}
//Leggi e copia il tag in firstTag, saltando eventuali attributi. Se il tag e' lo stesso di quello precedente, passato via firstTag,restituisci ARRAY. Salta nodi autoconclusivi (NULLNODE). Altrimenti restituisci NODE
int tagProcess(FI fileint, char* firstTag, int isFirst)
{
	int curchar;
	int isEqual = 1;
	int i = 0;
	int quoteSingle = 0;
	int quoteDouble = 0;
	int backslash=0;
	do
	{
		curchar = fi_getchar(fileint);
		if(firstTag[i]!='\0'||i==0)
			isEqual = isEqual && (firstTag[i] == curchar);
		if (lowercaseTags)
			curchar = tolowercase(curchar);
		firstTag[i] = curchar;
		i++;
	} while (curchar >= 33 && curchar != '/'&&curchar != '>'&&i<TAGLEN);
	i--;
	firstTag[i] = '\0';
	if (curchar != '>'&&curchar != '/')
	{
		do
		{
			curchar = fi_getchar(fileint);
			if (curchar == '\\')
			{
				backslash = (backslash + 1) & 1;
			}
			else if (curchar == '"')
			{
				if (backslash != 1 && quoteDouble != -1)
				{
					quoteDouble = (quoteDouble + 1) & 1;
					if (quoteDouble == 1)
						quoteSingle = -1;
					else
						quoteSingle = 0;
				}
				backslash = 0;
			}
			else if (curchar == '\'')
			{
				if (backslash != 1 && quoteSingle != -1)
				{
					quoteSingle = (quoteSingle + 1) & 1;
					if (quoteSingle == 1)
						quoteDouble = -1;
					else
						quoteSingle = 0;
				}
				backslash = 0;
			}
			else if ((curchar == '>'||curchar=='/')&&quoteSingle <=0 && quoteDouble <= 0)
			{
				break;
			}
			else
			{
				backslash = 0;
			}
		} while (curchar > 0);
	}
	if (curchar == '/')
	{
		fi_skip(fileint, 1);
		return NULLNODE;
	}
	else if (!isFirst&&isEqual)
		return ARRAY;
	else
		return NODE;
}
//Dato un carattere qualsiasi, se e' una xml entity unescapalo, altrimenti ritorna quanto avuto in ingresso
int unescape_xml(int curchar, FI fileint)
{
	if (curchar < 0)
		return curchar;
	if (curchar == '&')
	{
		if (fi_test(fileint, "amp;\0"))
		{
			fi_skip(fileint, 4);
			return '&';
		}
		else if (fi_test(fileint, "quot;\0"))
		{
			fi_skip(fileint, 5);
			return '"';
		}
		else if (fi_test(fileint, "apos;\0"))
		{
			fi_skip(fileint, 5);
			return '\'';
		}
		else if (fi_test(fileint, "lt;\0"))
		{
			fi_skip(fileint, 3);
			return '<';
		}
		else if (fi_test(fileint, "gt;\0"))
		{
			fi_skip(fileint, 3);
			return '>';
		}
		else if (fi_test(fileint, "#x\0"))
		{
			fi_skip(fileint, 2);
			int accumulator = 0;
			curchar = 0;
			do 
			{
				curchar = fi_getchar(fileint);
				if ((curchar >= '0'&&curchar <= '9') || (curchar >= 'A'&&curchar <= 'F') || (curchar >= 'a'&&curchar <= 'f'))
				{
					accumulator *= 16;
					if (curchar >= '0'&&curchar <= '9')
					{
						accumulator += (curchar - '0');
					}
					else
					{
						accumulator += (tolowercase(curchar) - 'a' + 10);
					}
				}
				else
					break;
			} while (1);
			if (accumulator < '\b' || (accumulator >= '\r'&&accumulator < ' '))
				accumulator = 0;
			return accumulator;
		}
		else if (fi_test(fileint, "#\0"))
		{
			fi_skip(fileint, 1);
			int accumulator = 0;
			curchar = 0;
			do
			{
				curchar = fi_getchar(fileint);
				if (curchar >= '0'&&curchar <= '9')
				{
					accumulator *= 10;
					accumulator += (curchar - '0');
				}
				else
					break;
			} while (1);
			if (accumulator < '\b' || (accumulator >= '\r'&&accumulator < ' '))
				accumulator = 0;
			return accumulator;
		}
		else
			return '&';
	}
	return curchar;
}
char hex(int rem)
{
	if (rem < 10)
		return '0' + rem;
	else
		return 'a' + rem - 10;
}
//Preso un carattere qualsiasi, scrivilo su SI. Se e' speciale per json escapalo, se è sporco, saltalo.
void escape_jsonAndWrite(int curchar, SI stringint)
{
	if (curchar < '\b')
		return;
	if (curchar == '"')
	{
		si_appendChar(stringint, '\\');
	}
	else if (curchar <= '\r')
	{
		if (curchar == '\r')
		{
			return;
		}
		else if (curchar == '\n')
		{
			si_appendChar(stringint, '\\');
			si_appendChar(stringint, 'n');
			return;
		}
		else if (curchar == '\b')
		{
			return;
		}
		else if (curchar == '\f')
		{
			return;
		}
		else if (curchar == '\t')
		{
			si_appendChar(stringint, '\\');
			si_appendChar(stringint, 't');
			return;
		}
		else if (curchar == '\v')
			return;
	}
	else if (curchar < 32)
	{
		return;
	}
	else if (curchar == '\\')
	{
		si_appendChar(stringint, '\\');
		si_appendChar(stringint, '\\');
		return;
	}
	else if (curchar > 255)
	{
		int rem;
		si_appendChar(stringint, '\\');
		si_appendChar(stringint, 'u');
		rem = (curchar >> 12) & 15;
		si_appendChar(stringint, hex(rem));
		rem = (curchar >>8 )&15;
		si_appendChar(stringint, hex(rem));
		rem = (curchar >> 4) & 15;
		si_appendChar(stringint, hex(rem));
		rem = (curchar) & 15;
		si_appendChar(stringint, hex(rem));
		return;
	}
	si_appendChar(stringint, curchar);
}
//copia tutto il contenuto su SI fino a che non trovi un TAG di chiusura o il file termina. Ritorna se il contenuto era in realta' vuoto
int contentProcess(SI stringint,FI fileint,int isFirst)
{
	int written = 0;
	if (isFirst)
	{
		si_appendChar(stringint, '"');
	}
	int curchar;
	do {
		curchar = fi_getchar(fileint);
		if (curchar==-1 || curchar == '<')
			break;
		curchar = unescape_xml(curchar, fileint);
		escape_jsonAndWrite(curchar, stringint);
		written++;
	} while (1);
	if (curchar == '<')
	{
		fi_rewind(fileint, 1);
	}
	if (written == 0)
	{
		if (isFirst)
		{
			si_rewind(stringint, 1);//ignore le double quote che hai messo;
			return 1;
		}
	}
	else
		si_appendChar(stringint, '"');
	return 0;
}
//copia tutto il contenuto finche' non trovi un tag di chiusura o non finisce il file. Ritorna se il contenuto era in realta' vuoto
int cdataProcess(SI stringint, FI fileint, int isFirst)
{
	int written = 0;
	if (isFirst)
	{
		si_appendChar(stringint, '"');
	}
	int curchar;
	do {
		curchar = fi_getchar(fileint);
		escape_jsonAndWrite(curchar, stringint);
		if (curchar < 0 || (curchar == ']'&&fi_test(fileint, "]>\0")))
			break;
		else
			written++;
	} while (1);
	if (curchar >0)
	{
		si_rewind(stringint, 1);//sovrascrivi il ]
		fi_skip(fileint, 2);
	}
	if (written == 0)
	{
		if (isFirst)
		{
			si_rewind(stringint, 1);//ignore le double quote che hai messo;
			return 1;
		}
	}
	else
		si_appendChar(stringint, '"');
	return 0;
}
//inserisci la giusta chiusura in base al tipo di nodo precedente e rimasto aperto
void closure(SI stringint, int closureType, int enforce)
{
	switch (closureType)
	{
	case ARRAY:
	{
		si_appendChar(stringint, ']');
		if(enforce)
			si_appendChar(stringint, '}');
		break;
	}
	case NODE:
	{
		if(enforce)
			si_appendChar(stringint, '}');
		break;
	}
	}
}
//naviga il livello. Un livello comincia all'inizio del file o subito dopo un tag <tag>->qui comincia livello
int navigateLevel(SI stringint, int level,FI fileint) //level can be: purecontent, array, tagfather. array is a peculiar case of tagfather
{
	char firstTag[TAGLEN];
	firstTag[0] = '\0';
	int controlTakenAt = si_getCurPos(stringint);
	int lastCompleteItem = controlTakenAt;
	int isFirst = 1;
	int arrayAt = 0;
	int closureType = NODE;
	int textAt = 0;
	while (!fi_over(fileint))
	{
		//skip whitespace, comments and uninteresting tags
		int ret = SkipFluff(fileint);
		//puo' ottenere: CDATA,TAG,CONTENT oppure ERRORE
		if (ret == TAG)
		{
			if (isFirst)
			{
				si_appendChar(stringint, '{');
			}
			int tagtype = tagProcess(fileint, firstTag, isFirst);
			if (tagtype==ARRAY)//array
			{
				//situazione: testo volante dopo un nodo, che e' stato inserito, ma poi si scopre che quel nodo era parte di un array. soluzione temporanea: fai il rewind di quel testo, continuando a scrivere subito dopo il nodo precedente.
				if ((si_getCurPos(stringint) - 1) == textAt)
				{
					/*si_writeCharAt(stringint, '\0', textAt);
					si_insertStringAt(stringint, &si_getChars(stringint)[lastCompleteItem], controlTakenAt + 1);
					arrayAt = arrayAt + (textAt - lastCompleteItem);
					textAt = controlTakenAt + (textAt - lastCompleteItem);*/
					si_rewind(stringint, (textAt - lastCompleteItem+1));
					textAt = 0;
				}
				lastCompleteItem = si_getCurPos(stringint);
				si_appendChar(stringint, ',');
				si_writeCharAt(stringint, '[', arrayAt);
				closureType = ARRAY;
				isFirst = 0;
			}
			else if(tagtype==NODE)
			{
				if (closureType == ARRAY)
				{
					si_appendChar(stringint, ']');

				}
				else if (closureType == CONTENT) //il precedente era contenuto, ed era stato visto come un puretext. Trasforma in nodo e dai il tag al testo volante #text
				{
					si_insertStringAt(stringint, "{\"#text\":\0", controlTakenAt);
				}
				if (!isFirst)
				{
					lastCompleteItem = si_getCurPos(stringint);
					si_appendChar(stringint, ',');

				}
				closureType = NODE;
				si_appendChar(stringint, '"');
				si_appendString(stringint, firstTag, '\0');
				si_appendChar(stringint, '"');
				si_appendChar(stringint, ':');
				arrayAt = si_getCurPos(stringint);
				si_appendChar(stringint, ' ');
				isFirst = 0;
			}
			else if (tagtype == NULLNODE)
			{
				if (isFirst)
					si_rewind(stringint, 1);
				continue;
			}
			ret=navigateLevel(stringint, level + 1, fileint);
			if (ret == GOPARENT || ret == OK)
				ret = CONTINUE;
			else if (ret == ENDED_BEFORE_EXPECTED || ret == INCOMPLETE)
			{
				if(level>SAVE_LEVEL)
					si_setPos(stringint,lastCompleteItem);
				closure(stringint, closureType,1);
				return INCOMPLETE;
			}
			int chared;
			do
			{
				chared = fi_getchar(fileint);
			} while (chared > 0 && chared != '>');
			if (ONLY_ONE_ROOT&&!isFirst&&level == 0)
				ret = GOPARENT;
			//GOPARENT, ENDED BEFORE EXPECTED,BAD FORMAT
		}
		else if (ret == CONTENT||ret==CDATA)
		{
			int tempClosure = closureType;
			if (!isFirst&&(closureType == NODE||closureType==ARRAY))//<tag>blabla</tag>content ->#text
			{
				if (textAt==(si_getCurPos(stringint)-1))
				{
					si_rewind(stringint, 1);
					textAt = -1;
				}
				if (textAt == 0&&!fi_test(fileint,"]]>")&&!(closureType==ARRAY&&!ALLOW_TEXT_AFTER_ARRAY))
				{
					closure(stringint, closureType,0);
					lastCompleteItem = si_getCurPos(stringint);
					si_appendString(stringint, ",\"#text\": \0", '\0');
					closureType = NODE;
					isFirst = 1;//altrimenti non mette le "
				}
				else if (textAt == -1)
				{
					//do not skip
				}
				else
				{
					char chared;
					//skippa, in futuro inserisci dentro textAt.
					do
					{
						chared = fi_getchar(fileint);
					} while (chared > 0 && !(ret==CONTENT&&chared == '<')&&!(ret==CDATA&&chared==']'&&fi_test(fileint,"]>\0")));
					if (chared > 0 && ret == CONTENT)
						fi_rewind(fileint, 1);
					else if (chared > 0 && ret == CDATA)
						fi_skip(fileint, 2);
					continue;
				}
			}
			else
			{
				closureType = CONTENT;
				if (si_getLastChar(stringint) == '"')
					si_rewind(stringint, 1);
			}
			if (ret == CONTENT)
				ret=contentProcess(stringint, fileint, isFirst);//copy until '<'
			else if (ret == CDATA)
				ret=cdataProcess(stringint, fileint, isFirst);
			if (ret == 0)
			{
				isFirst = 0;
				textAt = si_getCurPos(stringint) - 1;
			}
			else
				closureType = tempClosure;
			ret = CONTINUE;
		}
		if (ret == GOPARENT)
		{	
			if (isFirst)//e' entrato nel nuovo livello ma ha subito trovato il tag di chiusura. Metti null
			{
				si_appendString(stringint, "null\0", '\0');
				closureType = CONTENT;
			}
			closure(stringint, closureType,1);
			return OK;
		}
		else if(ret!=CONTINUE)
		{
			closure(stringint, closureType,1);
			return ret;
		}
	}
	//leggi contenuto, se incontri <nuovo figlio, se incontri </ ritorna
	closure(stringint, closureType,1);
	return ENDED_BEFORE_EXPECTED;
}
char* xml2stringifiedJson(const char* filePath, int lowercasetags)
{
	//clock_t begin = clock();
	SI stringInterface = si_init();
	lowercaseTags = lowercasetags;
	FI fileInterface = fi_init(filePath);
	if (fileInterface == 0)
	{
		return (char*)0;
	}	
	int Ret = navigateLevel(stringInterface, 0, fileInterface);
	//clock_t end = clock();
	//double time_spent = (double)(end*1000 - begin*1000) / CLOCKS_PER_SEC;
	//printf("\nExecution time: %f", time_spent);
	si_appendChar(stringInterface,'\0');
	//FILE* fp = fopen("save.json", "w");
	//fwrite(si_getChars(stringInterface), 1, si_getCurPos(stringInterface)-1, fp);
	//fclose(fp);
	return si_getChars(stringInterface);
	//close file	
}