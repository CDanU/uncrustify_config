/** Daniel Chumak | uncrustify_config v0.1.0 | GPLv2+ License 
    github.com/CDanU/uncrustify_config */


/// <reference path="../typings/index.d.ts" />
/// <reference path="../uncrustify/emscripten/libUncrustify.d.ts" />
/// <reference path="../typings/map.d.ts" />


type HTMLElementValue    = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
type OptionPrimitiveType = string | boolean | number;

import * as libUncrustify from "libUncrustify";
import * as fileSaver from "file-saver";
import * as ko from "knockout";
require( 'brace' );
require( 'brace/theme/solarized_dark' );
require( 'brace/mode/javascript' );
require( 'brace/mode/c_cpp' );

module uncrustify_config
{
    const Uncrustify: LibUncrustify.Uncrustify = libUncrustify;
    Uncrustify.set_quiet();

    const editor = ace.edit( "exampleEditorBox" );
    editor.$blockScrolling = Infinity;

    const editorSession = editor.getSession();
    editor.setShowInvisibles( true ); // shows whitespace
    editor.setShowPrintMargin( true );
    editorSession.setTabSize( 8 );
    editor.setFontSize( "12pt" );
    editor.setTheme( "ace/theme/solarized_dark" );
    // TODO: change language highlighting based on selected option
    editorSession.setMode( 'ace/mode/c_cpp' );

    namespace SelectorCache
    {
        export const TabContainers: HTMLElement[] = [
            document.getElementById( "tab0" ),
            document.getElementById( "tab1" ),
            document.getElementById( "tab2" ),
            document.getElementById( "tab3" )
        ];
        export const Tabs = < NodeListOf < HTMLElement > > document.querySelectorAll( "nav div" );
        export const ConfigInput          = < HTMLTextAreaElement > document.getElementById( "configInput" );
        export const ConfigDescriptionBox = < HTMLTextAreaElement > document.getElementById( "configDescriptionBox" );
        export const ConfigOutput = < HTMLTextAreaElement > document.getElementById( "configOutput" );
        export const ConfigOutputWithDoc      = < HTMLInputElement > document.getElementById( "configOutputWithDoc" );
        export const ConfigOutputOnlyNDefault = < HTMLInputElement > document.getElementById( "configOutputOnlyNDefault" );
        export const FileInput        = < HTMLTextAreaElement > document.getElementById( "fileInput" );
        export const FileOutput       = < HTMLTextAreaElement > document.getElementById( "fileOutput" );
        export const FileInputConfig  = < HTMLInputElement > document.getElementById( "fileInputConfig" );
        export const FileInputFile    = < HTMLInputElement > document.getElementById( "fileInputFile" );
        export const SaveConfig       = < HTMLInputElement > document.getElementById( "saveConfig" );
        export const SaveFileFormated = < HTMLInputElement > document.getElementById( "saveFileFormated" );
        export const ExampleEditorBox = < HTMLDivElement > document.getElementById("exampleEditorBox");
    }

    enum UpdateSource
    {
        Editor       = 0,
        ConfigOutput = 1,
        ConfigInput  = 2,
        None         = 999,
    }

    enum TabStates
    {
        readConfigFile   = 0,
        editConfig       = 1,
        outputConfigFile = 2,
        fileIO = 3,
    }

    const dependencyMap = new Map< string, string[] >( [
        [ "sp_angle_shift", [ "sp_permit_cpp11_shift" ] ],
        [ "sp_before_unnamed_byref", [ "sp_before_byref" ] ],
        [ "sp_before_unnamed_ptr_star", [ "sp_before_ptr_star" ] ],
        [ "sp_catch_paren", [ "sp_before_sparen" ] ],
        [ "sp_cmt_cpp_start", [ "sp_cmt_cpp_doxygen", "sp_cmt_cpp_qttr" ] ],
        [ "sp_func_call_paren_empty", [ "sp_func_call_paren" ] ],
        [ "sp_scope_paren", [ "sp_before_sparen" ] ],
        [ "sp_template_angle", [ "sp_before_angle" ] ],
        [ "sp_version_paren", [ "sp_before_sparen" ] ],
        [ "sp_before_tr_emb_cmt", [ "sp_num_before_tr_emb_cmt" ] ],

        [ "indent_align_string", [ "indent_xml_string" ] ],
        [ "indent_access_spec_body", [ "indent_access_spec" ] ],
        [ "indent_braces", ["indent_braces_no_func", "indent_braces_no_struct", "indent_braces_no_class"] ],
        [ "indent_class_on_colon", [ "indent_class_colon" ] ],
        [ "indent_first_bool_expr", [ "indent_bool_paren" ] ],
        [ "indent_namespace", [ "indent_namespace_level", "indent_namespace_limit", "indent_namespace_single_indent" ] ],
        [ "indent_oc_block", ["indent_oc_block_msg_from_brace", "indent_oc_block_msg_from_caret", "indent_oc_block_msg_from_colon", "indent_oc_block_msg_from_keyword"] ],
        [ "indent_oc_block_msg_xcode_style", ["indent_oc_block_msg_from_brace", "indent_oc_block_msg_from_caret", "indent_oc_block_msg_from_colon", "indent_oc_block_msg_from_keyword"] ],
        [ "indent_shift", [ "align_left_shift" ] ],
        [ "indent_func_call_param", ["indent_param"]],
        [ "indent_func_def_param", ["indent_param"]],
        [ "indent_func_proto_param", ["indent_param"]],
        [ "indent_func_class_param", ["indent_param"]],
        [ "indent_func_ctor_var_param", ["indent_param"]],
        [ "indent_param", ["indent_func_param_double"]],

        [ "align_single_line_brace", [ "align_func_proto_span", "align_single_line_brace_gap" ] ],
        [ "align_single_line_func", [ "align_func_proto_span" ] ],
        [ "cmt_insert_class_header", [ "cmt_insert_before_preproc" ] ],
        [ "cmt_insert_func_header", [ "cmt_insert_before_inlines", "cmt_insert_before_ctor_dtor", "cmt_insert_before_preproc" ] ],
        [ "cmt_insert_oc_msg_header", [ "cmt_insert_before_preproc" ] ],
        [ "cmt_reflow_mode", [ "cmt_width" ] ],


        [ "mod_full_brace_if_chain_only", [ "mod_full_brace_if_chain" ] ],
        [ "nl_after_access_spec", [ "nl_typedef_blk_start", "nl_var_def_blk_start" ] ],
        [ "nl_after_brace_open_cmt", [ "nl_after_brace_open" ] ],
        [ "nl_class_init_args", [ "pos_class_comma" ] ],
        [ "nl_constr_colon", [ "nl_constr_init_args", "pos_constr_colon", "pos_constr_comma" ] ],
        [ "nl_ds_struct_enum_close_brace", [ "eat_blanks_before_close_brace" ] ],
        [ "nl_elseif_brace", [ "nl_if_brace" ] ],
        [ "nl_oc_msg_args", [ "nl_oc_msg_leave_one_liner" ] ],
        [ "nl_start_of_file", [ "nl_start_of_file_min" ] ],
        [ "nl_end_of_file", [ "nl_end_of_file_min" ] ],
        [ "output_tab_size", [ "align_with_tabs" ] ],
        [ "pos_class_colon", [ "nl_class_colon" ] ],
        [ "pos_constr_comma", [ "pos_constr_colon" ] ],
        [ "pp_indent_count", [ "pp_indent_at_level" ] ],
        [ "pp_indent_if", [ "pp_indent_at_level", "output_tab_size" ] ],
        [ "pp_space_count", [ "pp_space" ] ],

        [ "use_indent_continue_only_once", [ "indent_continue" ] ],
        [ "use_indent_func_call_param", [ "indent_func_call_param" ] ],
        [ "ls_for_split_full", [ "code_width" ] ],
        [ "ls_func_split_full", [ "code_width" ] ],
        [ "ls_code_width", [ "code_width" ] ],

        [ "align_assign_span", [ "align_assign_thresh", "align_enum_equ_span" ] ],
        [ "align_enum_equ_span", [ "align_enum_equ_thresh" ] ],
        [ "align_right_cmt_span", [ "align_right_cmt_at_col", "align_right_cmt_gap" ] ],
        [ "align_var_struct_span", [ "align_var_struct_thresh", "align_var_struct_gap",
                                     "align_single_line_brace_gap", "align_mix_var_proto",
                                     "align_single_line_func", "align_single_line_brace",
                                     "align_var_def_colon", "align_var_def_attribute",
                                     "align_var_def_colon_gap", "align_var_def_inline" ] ],
        [ "align_var_class_span", [ "align_var_class_thresh", "align_var_class_gap",
                                    "align_single_line_brace_gap", "align_mix_var_proto",
                                    "align_single_line_func", "align_single_line_brace",
                                    "align_var_def_colon", "align_var_def_attribute",
                                    "align_var_def_colon_gap", "align_var_def_inline" ] ],
        [ "align_var_def_span", [ "align_var_def_thresh", "align_var_def_gap",
                                  "align_single_line_brace_gap", "align_mix_var_proto",
                                  "align_single_line_func", "align_single_line_brace",
                                  "align_var_def_colon", "align_var_def_attribute",
                                  "align_var_def_colon_gap", "align_var_def_inline" ] ],
        ["align_struct_init_span", ["align_number_left"]],
        ["align_typedef_span", ["align_typedef_gap", "align_typedef_star_style", "align_typedef_amp_style"]],
        ["align_mix_var_proto", ["align_func_proto_span"]],
        ["align_func_proto_span", ["align_func_proto_gap", "align_on_operator"]],
        ["align_pp_define_span", ["align_pp_define_together"]],
        ["align_oc_decl_colon", ["align_on_tabstop"]],


        ["cmt_star_cont", ["cmt_sp_after_star_cont"]],
        ["cmt_indent_multi", ["cmt_multi_check_last", "cmt_multi_first_len_minimum", "cmt_star_cont"]],
        ["mod_sort_oc_properties", ["mod_sort_oc_property_thread_safe_weight",
                                       "mod_sort_oc_property_readwrite_weight",
                                       "mod_sort_oc_property_reference_weight",
                                       "mod_sort_oc_property_getter_weight",
                                       "mod_sort_oc_property_setter_weight",
                                       "mod_sort_oc_property_nullability_weight"]],
        ["pp_indent", ["pp_indent_count"]],
        ["pp_define_at_level", ["pp_indent_at_level"]],
        ["pp_space", ["pp_space_count"]],
        ["indent_class_colon", ["indent_class_on_colon"]],
        ["indent_constr_colon", ["indent_class_on_colon"]],

        ["nl_max_blank_in_func", ["nl_max"]],
        ["cmt_width", ["cmt_sp_after_star_cont"]],
    ] );

    // options that do not operate on their own and need a parent option activated
    const childOptions_depend = new Set< string >([
        "align_var_struct_thresh",
        "align_var_struct_gap",
        "align_var_class_thresh",
        "align_var_class_gap",
        "align_var_def_thresh",
        "align_var_def_gap",
        "align_var_def_attribute",
        "align_var_def_colon_gap",
        "align_right_cmt_gap",
        "align_right_cmt_at_col",
        "align_var_def_inline",
        "align_assign_thresh",
        "align_enum_equ_span",
        "align_enum_equ_thresh",
        "align_typedef_gap",
        "align_typedef_star_style",
        "align_typedef_amp_style",
        "align_on_operator",
        "align_func_proto_gap",
        "align_pp_define_together",
        "cmt_multi_check_last",
        "cmt_multi_first_len_minimum",
        "mod_sort_oc_property_thread_safe_weight",
        "mod_sort_oc_property_readwrite_weight",
        "mod_sort_oc_property_reference_weight",
        "mod_sort_oc_property_getter_weight",
        "mod_sort_oc_property_setter_weight",
        "mod_sort_oc_property_nullability_weight",
        "pp_indent_count",
        "pp_indent_at_level",
        "pp_space_count",
        "indent_class_on_colon",
        "indent_braces_no_class",
        "indent_braces_no_func",
        "indent_braces_no_struct",
        "indent_oc_block_msg_from_brace",
        "indent_oc_block_msg_from_caret",
        "indent_oc_block_msg_from_colon",
        "indent_oc_block_msg_from_keyword",
        "indent_namespace_level",
        "indent_namespace_single_indent",
        "indent_namespace_limit",
        "sp_num_before_tr_emb_cmt",
        "indent_param",
        "indent_xml_string",
        "sp_cmt_cpp_doxygen",
        "sp_cmt_cpp_qttr",
        "nl_start_of_file_min",
        "nl_end_of_file_min",
        "cmt_sp_after_star_cont",
    ]);

    // region exampleStrings
    enum ExampleStringEnum
    {
        noExample,
        noExampleYet,
        example1,
        example2,
        indentBraces,
        example4,
        multiNamespace,
        arith,
        paren,
        brace,
        func,
        cls,
        space_misc,
        if_else,
        string,
        indentBraceParent,
    }

    const exampleStringEnum_string_Map = new Map<ExampleStringEnum, string>( [
        [ ExampleStringEnum.noExample, `no example available` ],
        [ ExampleStringEnum.noExampleYet, `no example available yet` ],
//------------------------------------------------------------------------------
        [ ExampleStringEnum.example1, `string t2 =\t"Test\tString\t1";` ],
//------------------------------------------------------------------------------
        [ ExampleStringEnum.example2,
`void f(list<list<B>>=val);
else{
//double tickNumber = (leftRange/(double)lineLength)*i;
leftTextItem = scene->addText(QString::number( 1000 ));}` ],
//------------------------------------------------------------------------------
        [ ExampleStringEnum.indentBraces,
`namespace n
{
class c :   public a,
private b
{
    struct s
    {
        int f( int a )
        {
            //comment1
            if(true)
            {
                auto lFunc = [this](int i){
                             int b = std::vector<int>({1, 2, 3})[2];
                             return b+i;
                         };
                return lFunc(a);
            }
            return 1;
        }
    }
}
}` ],
        [ ExampleStringEnum.multiNamespace,
`namespace ns0{
void func0();
namespace ns1  {
void func1();
void func2();
void func3();
void func4();
void func5();
void func6();
}
namespace ns2{
void func7();
namespace ns3{
void func8();
}
}
}` ],
        [ ExampleStringEnum.arith,
`int Aa0=1+2 + -1 + -  1;//1
int Aaaa1  =  1  - 2; // -1
float Aaaaaa2 = 1 /  2.0;  //  0.5
int Aaaaaaaaaa3 = 1 * 2;/* 2 */
int Aaaaaaaaaaaaa4 = 1 << 2;  /* 4 */

int Aaaaaa5 = 1 >> 2; /* 0 */
Aaaaaa5++;
Aaaaaa5  --  ;



double Aaa7 =  1 % 2; //! 1
auto Af8 = [=  ](){
		   return 1 | 2;
	   }; //<  3


bool b = !a||  (!  b  && (c ||  ~d) || ~  e)==  True;

enum tenum  :  unsigned int {e_val0=1,
	                         e_val1  =  1  };

void func_proto(int i=  5);

bool d = (b  ==  a)  ?  f  :  g; //: qt cmt0
bool e = (b==a) ? f : g; //~  qt cmt1
bool e = b ?: f;
bool e = c ?  : f;`
    ],
        [ ExampleStringEnum.paren,
`
class t :  public x
private y
{
t::t() : n(7)
, m(7)
, o(7)
, p(7);
}

int t::operator  +  (int i){
        return 0;
}

int t::d_func(bool p1,int p2,  int p3){
	if(p1)
		for(;; ) {return 0}
	if(  !p1  ) {
		for(;; )  {return 0}

		char a[]  = "This is a test";
		a[0] = 's';
		a  [  0  ] = 'a';

		int p = (int)(33/4);
		int q = (  int  )  (63/4);
		double r = double(p) * sizeof(int);
		double s = double  (q) * sizeof  (int);
	}
	switch(p2) {
	case 1:
		return 0;
		break;
	default  :
		return 9;
	}
}
` ],
        [ ExampleStringEnum.brace,
`
class Null0 {};
class Null1 {  };

int i = int {3  };

struct a {int j;  };

` ],
        [ ExampleStringEnum.func,
`void*p_func0(int i);
void*   p_func1  (  int i  )  ;

void p_func2();
void   p_func2  (  )  ;


void e_func0(){
	return(1);
};
void   e_func1  (  )  {
	return  (  1  )  ;
};

void p_func0(int i){
	return 1;
};
void  p_func1  (  int i  )  {
	return 1;
};


p_func0();
p_func0  (  );

e_func1(1);
e_func0  (  1  )  ;


void (*foo)(int);
void (  *bar  )  (  int  )  ;
`],
        [ ExampleStringEnum.cls,
`
class t : public x {
    t() : n(7);
    t  ()  :  n(  7  );

    t(int i) : n(7);
    t  (  int i  )  :  n(  7  );
}

int t::operator*(int i){
        return 0;
}

int t  ::  operator  +  (  int i  ){
        return 0;
}

int a = s.fun();
int b = u  ->  fun();

int c = *u;
int d = *  u;


`],
        [ ExampleStringEnum.space_misc,
`
#if defined(FOO)
    __attribute__((noreturn)) void d0(void);
#elif defined  (  FOO  )
    __attribute__((noreturn)) void d1(void);
#else//sp_endif_cmt0
    __attribute__((noreturn)) void d2(void);
#endif  /* sp_endif_cmt
           1
         */

if (i > 5) { throw(std::overflow_error("too big")) };
if (i > 7) { throw  (  std::overflow_error("way too big")  ) };

try  {
        int i = 1/0;
}catch(const std::overflow_error& e){
        return int{1};
}  catch  (...){
        return   int  {  0  };
}

std::set<int> s{ 1,2,3,4,5 };
std::set<int>   t  { 1,2,3,4,5 };


#define   X           80
#define   SQUARE(a)   (a\\
                        *  \\
                       a)

typedef enum { a = 1 }aaa;
typedef enum { a = 1 }    aaa;

int* a = & b;

extern "C" {
   void foo();
}

char* a = new    (char[20]);
delete[] a;

while(1) ;`],
        [ ExampleStringEnum.if_else,
`
if(!p){
	return 1;
}else if(p){
	return 2;
}else{
	return 3;
}

if  (  !p  )  {
	return 1;
}  else if  (  p  )  {
	return 2;
}  else  {
	return 3;
}
`],
        [ ExampleStringEnum.string,
`
string a = "<xml>"
           "<data Parent=\\"%d\\" Name=\\"%s\\">"
           "<Child Id=\\"%d\\"/>"
           "</data>"
           "</xml>";

string b = "Lorem ipsum dolor sit amet, \\
                    consetetur sadipscing elitr"; //TODO
`],

        [ ExampleStringEnum.indentBraceParent,
`// IF|DO:3, FOR|ELSE:4, WHILE|USING:6, SWITCH:7, ELSEIF:8, SYNCHRONIZED:13
if(true)
{
	do
	{
		return 1
	}
	while(false)

	for(;; )
	{
		return 1;
	}
}
else if(false)
{
	switch(x)
	{
	case 1:
		break;
	default:
		break;
	}
}
else
{
	synchronized(this) //TODO set lang to java
	{
		return 1;
	}
}`]


]);

    const optionNameString_Map = new Map<string, string>( [
        ["sp_arith", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["sp_assign", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["sp_cpp_lambda_assign", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["sp_cpp_lambda_paren", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["sp_assign_default", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["sp_before_assign", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["sp_after_assign", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        // sp_enum_paren //OC
        ["sp_enum_assign", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["sp_enum_before_assign", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["sp_enum_after_assign", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["sp_bool", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["sp_compare", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["sp_cond_colon", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["sp_cond_colon_before", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["sp_cond_colon_after", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["sp_cond_question", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["sp_cond_question_before", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["sp_cond_question_after", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["sp_cond_ternary_short", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["sp_before_tr_emb_cmt", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["align_right_cmt_span", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["align_assign_span", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["disable_processing_cmt", exampleStringEnum_string_Map.get( ExampleStringEnum.noExample) ],
        ["enable_processing_cmt", exampleStringEnum_string_Map.get( ExampleStringEnum.noExample) ],
        ["input_tab_size", exampleStringEnum_string_Map.get( ExampleStringEnum.example1) ],
        ["newlines", exampleStringEnum_string_Map.get( ExampleStringEnum.indentBraces) ],
        ["output_tab_size", exampleStringEnum_string_Map.get( ExampleStringEnum.example1) ],
        ["tok_split_gte", exampleStringEnum_string_Map.get( ExampleStringEnum.example2) ],
        ["utf8_bom", exampleStringEnum_string_Map.get( ExampleStringEnum.noExample) ],
        ["utf8_byte", exampleStringEnum_string_Map.get( ExampleStringEnum.noExample) ],
        ["utf8_force", exampleStringEnum_string_Map.get( ExampleStringEnum.noExample) ],
        ["sp_before_sparen", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],
        ["sp_inside_sparen", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],
        ["sp_inside_sparen_close", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],
        ["sp_inside_sparen_open", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],
        ["sp_after_sparen", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],
        ["sp_sparen_brace", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],
        //["sp_special_semi", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],
        ["sp_before_semi", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],
        ["sp_before_semi_for", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],
        ["sp_before_semi_for_empty", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],
        ["sp_before_squares", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],
        ["sp_inside_square", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],
        ["sp_after_comma", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],
        ["sp_before_comma", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],

        //["sp_before_ellipsis", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],
        ["sp_after_class_colon", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],
        ["sp_before_class_colon", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],
        ["sp_after_constr_colon", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],
        ["sp_before_constr_colon", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],
        ["sp_before_case_colon", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],

        ["sp_after_operator", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],
        ["sp_after_operator_sym", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],
        //["sp_after_operator_sym_empty", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],

        ["sp_after_cast", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],
        ["sp_inside_paren_cast", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],

        ["sp_sizeof_paren", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],

        ["sp_inside_braces_enum", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],

        ["sp_inside_braces_struct", exampleStringEnum_string_Map.get( ExampleStringEnum.brace) ],
        ["sp_inside_braces", exampleStringEnum_string_Map.get( ExampleStringEnum.brace) ],
        ["sp_inside_braces_empty", exampleStringEnum_string_Map.get( ExampleStringEnum.brace) ],

        ["sp_type_func", exampleStringEnum_string_Map.get( ExampleStringEnum.func) ],
        ["sp_func_proto_paren", exampleStringEnum_string_Map.get( ExampleStringEnum.func) ],
        ["sp_func_proto_paren_empty", exampleStringEnum_string_Map.get( ExampleStringEnum.func) ],
        ["sp_func_def_paren", exampleStringEnum_string_Map.get( ExampleStringEnum.func) ],
        ["sp_func_def_paren_empty", exampleStringEnum_string_Map.get( ExampleStringEnum.func) ],

        ["sp_inside_fparens", exampleStringEnum_string_Map.get( ExampleStringEnum.func) ],
        ["sp_inside_fparen", exampleStringEnum_string_Map.get( ExampleStringEnum.func) ],

        ["sp_inside_tparen", exampleStringEnum_string_Map.get( ExampleStringEnum.func) ],
        ["sp_after_tparen_close", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],

        //["sp_square_fparen", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],
        ["sp_fparen_brace", exampleStringEnum_string_Map.get( ExampleStringEnum.func) ],
        //["sp_fparen_dbrace", exampleStringEnum_string_Map.get( ExampleStringEnum.func) ],
        ["sp_func_call_paren", exampleStringEnum_string_Map.get( ExampleStringEnum.func) ],
        ["sp_func_call_paren_empty", exampleStringEnum_string_Map.get( ExampleStringEnum.func) ],
        ["sp_return_paren", exampleStringEnum_string_Map.get( ExampleStringEnum.func) ],

        ["sp_func_call_user_paren", exampleStringEnum_string_Map.get( ExampleStringEnum.noExample) ],



        ["sp_func_class_paren", exampleStringEnum_string_Map.get( ExampleStringEnum.cls) ],
        ["sp_func_class_paren_empty", exampleStringEnum_string_Map.get( ExampleStringEnum.cls) ],

        ["sp_attribute_paren", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],
        ["sp_defined_paren", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],

        //["sp_after_throw", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],
        ["sp_catch_paren", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],

        //["sp_version_paren", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],
        //["sp_scope_paren", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],
        //["sp_super_paren", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],
        //["sp_this_paren", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],

        ["sp_macro", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],
        ["sp_macro_func", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],

        ["sp_brace_typedef", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],

        //["sp_catch_brace", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],
        ["sp_brace_catch", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],

        //["sp_finally_brace", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],
        //["sp_brace_finally", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],

        ["sp_try_brace", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],

        //["sp_getset_brace", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],

        ["sp_word_brace", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],
        ["sp_word_brace_ns", exampleStringEnum_string_Map.get( ExampleStringEnum.multiNamespace) ],

        ["sp_before_dc", exampleStringEnum_string_Map.get( ExampleStringEnum.cls) ],
        ["sp_after_dc", exampleStringEnum_string_Map.get( ExampleStringEnum.cls) ],

        //["sp_d_array_colon", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],

        ["sp_else_brace", exampleStringEnum_string_Map.get( ExampleStringEnum.if_else) ],
        ["sp_brace_else", exampleStringEnum_string_Map.get( ExampleStringEnum.if_else) ],


        ["sp_not", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["sp_inv", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["sp_sign", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["sp_incdec", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],

        ["sp_addr", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],
        ["sp_member", exampleStringEnum_string_Map.get( ExampleStringEnum.cls) ],
        ["sp_deref", exampleStringEnum_string_Map.get( ExampleStringEnum.cls) ],

        ["sp_sign", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["sp_incdec", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],

        ["sp_before_nl_cont", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],

        ["sp_cond_ternary_short", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],


        //["sp_case_label", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],
        //["sp_range", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],

        // not working ?
        //["sp_after_for_colon", exampleStringEnum_string_Map.get( ExampleStringEnum.cls) ],
        //["sp_before_for_colon", exampleStringEnum_string_Map.get( ExampleStringEnum.cls) ],

        //["sp_extern_paren", exampleStringEnum_string_Map.get( ExampleStringEnum.cls) ],


        ["sp_cmt_cpp_start", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["sp_cmt_cpp_doxygen", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["sp_cmt_cpp_qttr", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],

        ["sp_endif_cmt", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],

        ["sp_after_new", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],
        ["sp_between_new_paren", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],

        //["sp_annotation_paren", exampleStringEnum_string_Map.get( ExampleStringEnum.cls) ],//java

        ["sp_skip_vbrace_tokens", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],

        ["force_tab_after_define", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],


        ["indent_columns", exampleStringEnum_string_Map.get( ExampleStringEnum.indentBraces) ],
        ["indent_continue", exampleStringEnum_string_Map.get( ExampleStringEnum.indentBraces) ],

        ["indent_with_tabs", exampleStringEnum_string_Map.get( ExampleStringEnum.indentBraces) ],
        ["indent_cmt_with_tabs", exampleStringEnum_string_Map.get( ExampleStringEnum.indentBraces) ],

        ["indent_brace", exampleStringEnum_string_Map.get( ExampleStringEnum.indentBraces) ],
        ["indent_braces", exampleStringEnum_string_Map.get( ExampleStringEnum.indentBraces) ],
        ["indent_brace_parent", exampleStringEnum_string_Map.get( ExampleStringEnum.indentBraceParent) ],
        //
        //
        ["indent_namespace", exampleStringEnum_string_Map.get( ExampleStringEnum.multiNamespace) ],
        //d
        ["indent_class", exampleStringEnum_string_Map.get( ExampleStringEnum.indentBraces) ],
        ["indent_class_colon", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],
        ["indent_class_on_colon", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],
        ["indent_constr_colon", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],






        ["indent_align_string", exampleStringEnum_string_Map.get( ExampleStringEnum.string) ],
        //




        ["sp_deref", exampleStringEnum_string_Map.get( ExampleStringEnum.cls) ],
        ["sp_deref", exampleStringEnum_string_Map.get( ExampleStringEnum.cls) ],
        ["sp_deref", exampleStringEnum_string_Map.get( ExampleStringEnum.cls) ],
        ["sp_deref", exampleStringEnum_string_Map.get( ExampleStringEnum.cls) ],
        ["sp_deref", exampleStringEnum_string_Map.get( ExampleStringEnum.cls) ],
        ["sp_deref", exampleStringEnum_string_Map.get( ExampleStringEnum.cls) ],
        ["sp_deref", exampleStringEnum_string_Map.get( ExampleStringEnum.cls) ],

    ] );
    // endregion

    // region languageFlags
    //! formating language options display strings
    const langFlagsStrings = [
        "C",
        "C++",
        "D",
        "C#",
        "Vala",
        "Java",
        "PAWN",
        "Objective-C",
        "JavaScript",
    ];

    //! maps Uncrustify language options to display strings
    const stringLangFlagsMap = new Map<string, EmscriptenEnumTypeObject>( [
        [ langFlagsStrings[0], Uncrustify.lang_flag_e.LANG_C ],
        [ langFlagsStrings[1], Uncrustify.lang_flag_e.LANG_CPP ],
        [ langFlagsStrings[2], Uncrustify.lang_flag_e.LANG_D ],
        [ langFlagsStrings[3], Uncrustify.lang_flag_e.LANG_CS ],
        [ langFlagsStrings[4], Uncrustify.lang_flag_e.LANG_VALA ],
        [ langFlagsStrings[5], Uncrustify.lang_flag_e.LANG_JAVA ],
        [ langFlagsStrings[6], Uncrustify.lang_flag_e.LANG_PAWN ],
        [ langFlagsStrings[7], Uncrustify.lang_flag_e.LANG_OC ],
        [ langFlagsStrings[8], Uncrustify.lang_flag_e.LANG_ECMA ],
    ] );
    // endregion
    //==========================================================================

    //! flag that is used to prevent multiple ViewModel initializations
    let modelBuild: boolean  = false;
    //! flags that are used for handling custom examples
    let editorFocused: boolean      = false;
    //! flags that are used for handling custom examples
    let editorChanged: boolean      = false;
    //! flags that are used for handling custom examples
    let customExampleUsed: boolean  = false;
    // ---
    //! updateSource: used to specify from which source the Uncrustify config needs
    //! to be updated, initially it is set to UpdateTarget.ConfigInput to catch
    //! the case where a page reload does not clear the text but no change event
    //! is fired
    let updateSource: UpdateSource = UpdateSource.ConfigInput;

    class Options
    {
        //! name of the option
        public name: string;
        //! type of the option, see Uncrustify.argtype_e
        public type: EmscriptenEnumTypeObject;
        //! option value, AT_BOOL -> bool, AT_Num -> number, else -> string
        public value: KnockoutObservable<OptionPrimitiveType>;
        public isDependentChild;
        //! stores option dependencies, initialy this variable is of type string[],
        //! but changes into options[] after the string have been resolved
        public dependencies;
        //! example on which the foramting will be performed
        public example: string;
        //! description of the option, consists of short and full description from Uncrustify
        public description: string;
        //! callback function that is called from the template to set the description
        public descriptionCallback: Function;
        //! callback function that is called from the template to handle changes
        public changeCallback: Function;
        public resetCallback: Function;

        constructor( name: string, type: EmscriptenEnumTypeObject, value: OptionPrimitiveType,
                     description: string, dependencies: string[], example: string, isDependentChild : boolean )
        {
            this.name         = name;
            this.type         = type;
            this.value        = ko.observable( value );
            this.description  = description;
            this.dependencies = dependencies;
            this.example      = example;
            this.isDependentChild = isDependentChild;
            // -----------------------------------------------------------------
            this.descriptionCallback = function()
            {
                setDescription( this.description );
                return true;
            };
            this.changeCallback = optionChange;
            this.resetCallback = function(obj)
            {
                this.descriptionCallback();
                optionChange(obj);
                return true;
            };
        }
    }

    class OptionsGroup
    {
        // name of the goup
        public name: string;
        // array of all options that belong to the group
        public options: Options[];

        constructor( name: string )
        {
            this.name    = name;
            this.options = [];
        }

        addOption( option: Options )
        {
            this.options.push( option );
        };
    }

    class GroupOptionsViewModel
    {
        //! all uncrustify Groups
        public groups: KnockoutObservableArray<OptionsGroup>;
        //! Uncrustifys text formatting option
        public isFragment: KnockoutObservable<boolean>;
        //! Uncrustifys text formatting option
        public fileLang: KnockoutObservable<string>;
        //! lookupMap to find Options
        public lookupMap = new Map<string, Options>();
        //! Uncrustifys Options for the type AT_IARF
        public AT_IARF = ['ignore', 'add', 'force', 'remove',];
        //! Uncrustifys Options for the type AT_POS
        public AT_POS  = ['ignore', 'join', 'lead', 'lead_break', 'lead_force', 'trail', 'trail_break', 'trail_force',];
        //! Uncrustifys Options for the type AT_LINE
        public AT_LINE = ['auto', 'lf', 'crlf', 'cr',];
        //! used inside the template to display available language options
        public langFlagStrings = langFlagsStrings;
        //----------------------------------------------------------------------

        /**
         *  builds lookupMap based on the options of the this.groups
         */
        private fillLookupMapFull()
        {
            for( let group of this.groups() )
            {
                for( let option of group.options )
                {
                    this.lookupMap.set( option.name, option );
                }
            }
        }

        /**
         * fills lookupMap based on the options of the passed in group
         * @param group: group which options will be added to the lookupMap
         */
        //private fillLookupMap( group: OptionsGroup )
        //{
        //    for( let option of group.options )
        //    {
        //        this.lookupMap.set( option.name, option );
        //    }
        //}

        /**
         * recursivly resolves string dependencies of Options
         * @param option: Option which dependencies will be resolved
         * @param unresolved: empty array that will get filled with unresolved options during the recursive steps
         * @param resolved: empty array that will get filled with resolved options during the recursive steps
         * @returns {string[]}: array with all resolved dependencies
         */
        private resolver( option: Options, unresolved: string[], resolved: string[] )
        {
            unresolved.push( option.name );

            for( let dependency of option.dependencies )
            {
                // skip if already resolved or
                // usually circular dependencies should throw an error, but here
                // their sub dependencies are just ignored (to break the circle)
                // in order to enable referencing from a->b and b->a
                // example: .a -> ..b -> ...c, ...a, ...d ==> b, c, d
                //          .b -> ..c, ..a, ..d           ==> a, c, d
                if( resolved.indexOf( dependency ) !== -1 ||
                    unresolved.indexOf( dependency ) !== -1 )
                {
                    continue;
                }

                let deppendencyOption = this.lookupMap.get( dependency );
                if( deppendencyOption == null )
                {
                    console.error( "dependency: " + dependency + " is missing in the lookupMap" );
                    continue;
                }

                this.resolver( deppendencyOption, unresolved, resolved );
            }

            resolved.push( option.name );

            // remove from unresolved
            const index0 = unresolved.indexOf( option.name );
            if( index0 > -1 ) { unresolved.splice( index0, 1 ); }

            if( unresolved.length === 0 )
            {
                // remove initial option
                const index1 = resolved.indexOf( option.name );
                if( index1 > -1 )
                { resolved.splice( index1, 1 ); }

                return resolved;
            }
        };

        /**
         * calls resolver on every option and to convert string dependencies to option dependencies
         */
        public resolveDependencies(): void
        {
            // resolves dependencies in order to guarantee all sub dependencies are included
            for( let group of this.groups() )
            {
                for( let option of group.options )
                {
                    option.dependencies = this.resolver( option, [], [] );
                }
            }

            // converts dependency strings[] into dependency Options[]
            // needs to be separated into two loops, so that the resolver only
            // works on strings and not a mix of string and Option
            for( let group of this.groups() )
            {
                for( let option of group.options )
                {
                    let optionDependencies: Options[] = [];
                    for( let dependency of option.dependencies )
                    {
                        let dependencyOption: Options = this.lookupMap.get( dependency );
                        if( dependencyOption == null )
                        {
                            console.error( "dependency: " + dependency + " is missing in the lookupMap" );
                            continue;
                        }
                        optionDependencies.push( dependencyOption );
                    }

                    option.dependencies = optionDependencies;
                }
            }
        }

        constructor()
        {
            this.isFragment = ko.observable( false );
            this.fileLang   = ko.observable( "C++" );
            this.groups     = ko.observableArray( [] );
            this.groups.subscribe( () => this.fillLookupMapFull.call( this ) );
        }
    }

    /**
     * alongside the event handlers this function controls the main program flow,
     * it manages tab and container styles, updates the Uncrustify config and
     * handles tab specific stuff
     *
     * @param nr: n-th tab that is going to be opened, 0-based
     * @returns {boolean}: false on failure
     */
    function openTab( nr: number ): boolean
    {
        if( isNaN(nr) || nr < 0 || nr >= SelectorCache.TabContainers.length )
        {
            return false;
        }

        // region manage active style state of tabs
        for( let elem of <any> SelectorCache.Tabs )
        {
            elem.classList.remove( "active" );
        }

        SelectorCache.Tabs[nr].classList.add( "active" );
        // endregion

        // region manage visibility of tab containers
        for( let elem of SelectorCache.TabContainers )
        {
            elem.style.display = "none";
            elem.classList.remove( "active" );
        }

        SelectorCache.TabContainers[nr].style.display = "flex";
        // endregion

        // region updateTarget
        switch( updateSource )
        {
            case UpdateSource.Editor:
            {
                loadSettingsFromModel();
                break;
            }
            case UpdateSource.ConfigInput:
            {
                loadSettings( SelectorCache.ConfigInput );
                break;
            }
            case UpdateSource.ConfigOutput:
            {
                loadSettings( SelectorCache.ConfigOutput );
                break;
            }
            default: {break;}
        }
        updateSource = UpdateSource.None;
        // endregion

        // region handle tab specific stuff
        switch( nr )
        {
            case TabStates.editConfig:
            {
                updateSource = UpdateSource.Editor;
                break;
            }
            case TabStates.outputConfigFile:
            {
                printSettings();
                break;
            }
            default: { break; }
        }
        // endregion

        return true;
    }

    /**
     * Value of passed Element is set as Uncrustifys config, calls updateModel
     * @param target which value will be set as Uncrustifys config
     */
    function loadSettings( target: HTMLElementValue ): void
    {
        Uncrustify.loadConfig( target.value );
        updateModel();
    }

    /**
     * sets Uncrustifys config based on the settings of the ViewModel
     */
    function loadSettingsFromModel(): void
    {
        ViewModel.lookupMap.forEach( function( option ){
            switch( option.type )
            {
                case Uncrustify.argtype_e.AT_IARF:
                case Uncrustify.argtype_e.AT_POS:
                case Uncrustify.argtype_e.AT_LINE:
                case Uncrustify.argtype_e.AT_STRING:
                {
                    Uncrustify.set_option( option.name, < string > option.value() );
                    break;
                }

                case Uncrustify.argtype_e.AT_BOOL:
                {
                    Uncrustify.set_option( option.name, option.value() === true ? "true" : "false" );
                    break;
                }

                case Uncrustify.argtype_e.AT_NUM:
                case Uncrustify.argtype_e.AT_UNUM:
                {
                    Uncrustify.set_option( option.name, option.value().toString() );
                    break;
                }

                default:
                {
                    return;
                }
            }
        } );
    }

    /**
     * prints current Uncrustify config according to the set output options into SelectorCache.ConfigOutput
     */
    function printSettings(): void
    {
        const optionDoc: boolean = SelectorCache.ConfigOutputWithDoc.checked;
        const optionDef: boolean = SelectorCache.ConfigOutputOnlyNDefault.checked;
        SelectorCache.ConfigOutput.value = Uncrustify.show_config( optionDoc, optionDef );
    }

    /**
     * used to change a single option in the Uncrustify configuration via the menu,
     * resets all Uncrustify options to default and sets the changed option and
     * its dependencies, handles example output
     * @param option: Option which value changed
     * @returns {boolean}: returns true to simulate html element default event handling
     */
    function optionChange( option: Options ): boolean
    {
        // reset all uncrustify options to default values
        Uncrustify.set_option_defaults();

        // set changed option
        Uncrustify.set_option( option.name, option.value().toString() );

        // set the dependencies of the option
        for( let dependency of option.dependencies )
        {
            Uncrustify.set_option( dependency.name, dependency.value().toString() );
        }

        // output_tab_size seems to be a global dependency
        const outputTabSizeOption: Options = ViewModel.lookupMap.get( "output_tab_size" );
        if( outputTabSizeOption != null )
        {
            Uncrustify.set_option( "output_tab_size", outputTabSizeOption.value().toString() );
        }
        const indentWithTabsOption: Options = ViewModel.lookupMap.get( "indent_with_tabs" );
        if( indentWithTabsOption != null )
        {
            Uncrustify.set_option( "indent_with_tabs", indentWithTabsOption.value().toString() );
        }
        // ----

        // write formated text to editor
        let crustyText = customExampleUsed ? editorSession.getValue() : option.example;
        editorSession.setValue( Uncrustify.uncrustify( crustyText, Uncrustify.lang_flag_e.LANG_CPP ) );

        return true;
    }

    /**
     * builds Knockout Model from Uncrustifys Groups and Options
     */
    function buildModel()
    {
        if( modelBuild ) { return; }

        const groupEnumValues = Uncrustify.uncrustify_groups;
        const group_map       = Uncrustify.getGroupMap();
        const option_name_map = Uncrustify.getOptionNameMap();
        let   groupsArr: OptionsGroup[] = [];


        let exclude_keys_set = new Set(["UO_option_count",
                                        "UO_include_category_first",
                                        "UO_include_category_last",
                                        "UG_group_count",
                                        "CT_TOKEN_COUNT_",
                                        "FLAG_PP",
                                        "FLAG_DIG",
                                        "LANG_ALL",
                                        "LANG_ALLC",
                                        "values"]); // special

        // iterate EmscriptenEnumType Object to get its keys, which are the enum
        // value names, in this case Group enums
        for( let enumVal in groupEnumValues )
        {
            // filter group enum values
            if( exclude_keys_set.has(enumVal) ) { continue; }

            // groupEnumValues[ enumVal ] : Object, enum option object
            const group_map_value = group_map.get( groupEnumValues[enumVal] );
            if( group_map_value == null ) { continue; }

            const group_object    = new OptionsGroup( enumVal.substr(3).toLowerCase() );
            const group_options_enum_values    = group_map_value.options;
            const group_options_len = group_options_enum_values.size();
            for( let i = 0; i < group_options_len; i++ )
            {
                const option_enum_value = group_options_enum_values.get( i );
                if( option_enum_value == null ) { continue; }

                const option_map_value = option_name_map.get( option_enum_value );
                if( option_map_value == null ) { continue; }
                // filter option enum values
                if( exclude_keys_set.has(option_map_value.name) ) { continue; }

                let option_setting: OptionPrimitiveType;
                switch( option_map_value.type )
                {
                    case Uncrustify.argtype_e.AT_IARF:
                    case Uncrustify.argtype_e.AT_POS:
                    case Uncrustify.argtype_e.AT_LINE:
                    case Uncrustify.argtype_e.AT_STRING:
                    {
                        option_setting = Uncrustify.get_option( option_map_value.name );
                        break;
                    }

                    case Uncrustify.argtype_e.AT_BOOL:
                    {
                        option_setting = Uncrustify.get_option( option_map_value.name ) === 'true';
                        break;
                    }

                    case Uncrustify.argtype_e.AT_NUM:
                    case Uncrustify.argtype_e.AT_UNUM:
                    {
                        option_setting = parseInt( Uncrustify.get_option( option_map_value.name ) );
                        break;
                    }

                    default:
                    {
                        continue;
                    }
                }

                let dependencies: string[] = dependencyMap.get( option_map_value.name );
                if( dependencies == null ) { dependencies = []; }

                let example: string = optionNameString_Map.get( option_map_value.name );
                if( example == null ) { example = exampleStringEnum_string_Map.get( ExampleStringEnum.noExampleYet); }

                const isDependentChild : boolean = childOptions_depend.has(option_map_value.name);
                const description : string = option_map_value.name + ": "
                                             + option_map_value.short_desc + "\n"
                                             + option_map_value.long_desc;


                const option_object:Options = new Options( option_map_value.name,
                                                           option_map_value.type,
                                                           option_setting,
                                                           description,
                                                           dependencies, example,
                                                           isDependentChild);

                group_object.addOption( option_object );
            }

            groupsArr.push( group_object );
        }
        ViewModel.groups( groupsArr );
        ViewModel.resolveDependencies();

        // special case: adjusts editor tab size
        const outputTabSizeOption: Options = ViewModel.lookupMap.get( "output_tab_size" );
        if( outputTabSizeOption != null )
        {
            editorSession.setTabSize( <number> outputTabSizeOption.value() );

            outputTabSizeOption.value.subscribe( function( o: number ){
                editorSession.setTabSize( o );
            } );
        }
        modelBuild = true;
    }

    /**
     *  updates ViewModel based on Uncrustifys currently loaded settings
     */
    function updateModel()
    {
        ViewModel.lookupMap.forEach( function( option ){
            let optVal: OptionPrimitiveType;

            switch( option.type )
            {
                case Uncrustify.argtype_e.AT_IARF:
                case Uncrustify.argtype_e.AT_POS:
                case Uncrustify.argtype_e.AT_LINE:
                case Uncrustify.argtype_e.AT_STRING:
                {
                    optVal = Uncrustify.get_option( option.name );
                    break;
                }

                case Uncrustify.argtype_e.AT_BOOL:
                {
                    optVal = Uncrustify.get_option( option.name ) === 'true';
                    break;
                }

                case Uncrustify.argtype_e.AT_NUM:
                case Uncrustify.argtype_e.AT_UNUM:
                {
                    optVal = parseInt( Uncrustify.get_option( option.name ) );
                    break;
                }

                default:
                {
                    return;
                }
            }

            option.value( optVal );
        } );
    }

    /**
     * fills SelectorCache.ConfigDescriptionBox with given string
     */
    function setDescription( text: string )
    {
        SelectorCache.ConfigDescriptionBox.value = text;
    }

    /**
     * fills SelectorCache.FileOutput with an uncrustifyed value of SelectorCache.FileInput
     * checks frag and language settings
     */
    function formatFile()
    {
        const isFrag      = ViewModel.isFragment();
        const langString  = ViewModel.fileLang();
        let   langEnumObj = stringLangFlagsMap.get( langString );

        if( langEnumObj == null )
        {
            console.error( "No fitting Enum Object found for the language" + langString + " Language set to C++" );
            langEnumObj = Uncrustify.lang_flag_e.LANG_CPP;
        }

        SelectorCache.FileOutput.value = Uncrustify.uncrustify( SelectorCache.FileInput.value, langEnumObj, isFrag );
    }

    /**
     * handles events from input[type:file] and file drops, only the first file will be read in as text
     * and passed to the specified callback function
     *
     * param e: event which holds filehandles in e.dataTransfer or e.target.files
     * param onLoadCallback: function that will be called when all filecontent is read as text
    */
    function handleFileSelect( e, onLoadCallback : Function )
    {
        e.stopPropagation();
        e.preventDefault();

        let file;
        if( e.dataTransfer != null && e.dataTransfer.files != null && e.dataTransfer.files[0] != null )
        {
            file = e.dataTransfer.files[0];
        }
        else if ( e.target.files != null && e.target.files[0] != null )
        {
            file = e.target.files[0];
        }
        else { return; }
        // _____________________________________________________________________

        const reader = new FileReader();
        reader.onload = function(){
            onLoadCallback(reader.result);
        };
        reader.readAsText( file );
    }

    //! prevents default drag over action
    function handleDragOver( e )
    {
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }

    //! Sets a given string as value to the ConfigInput Text area, sets the updateTarget
    function setConfigInputText( text : string )
    {
        SelectorCache.ConfigInput.value = text;
        updateSource = UpdateSource.ConfigInput;
    }

    //! Sets a given string as value to the FileInput Text area, calls formatFile();
    function setFileInputText( text : string )
    {
        SelectorCache.FileInput.value = text;
        formatFile();
    }

    //! assigns needed event handlers to the html nodes
    function assignEvents()
    {
        // region tabs
        const tabLen: number = SelectorCache.Tabs.length;
        for( let i: number = 0; i < tabLen; i++ )
        {
            SelectorCache.Tabs[i].onclick = () => openTab( i );
        }
        // endregion

        SelectorCache.ConfigInput.onchange = function()
        {
            updateSource = UpdateSource.ConfigInput;
        };

        SelectorCache.ConfigOutput.onchange = function()
        {
            updateSource = UpdateSource.ConfigOutput;
        };

        SelectorCache.ConfigOutputWithDoc.onchange      = printSettings;
        SelectorCache.ConfigOutputOnlyNDefault.onchange = printSettings;
        SelectorCache.FileInput.onchange = formatFile;

        ViewModel.isFragment.subscribe( formatFile );
        ViewModel.fileLang.subscribe( formatFile );

        // region fileIO textarea orientation
        const orientationBtnImg = <HTMLImageElement> document.getElementById( "orientationBtn" );
        orientationBtnImg.onclick = function(): void {
            const oBtnClsList = orientationBtnImg.classList;
            if( oBtnClsList.contains("rotate") )
            {
                oBtnClsList.remove("rotate");
                SelectorCache.TabContainers[TabStates.fileIO].classList.remove("rotate");
            }
            else
            {
                oBtnClsList.add("rotate");
                SelectorCache.TabContainers[TabStates.fileIO].classList.add("rotate");
            }
            // reset textarea size to always be able to see both after a switch
            // (chromium behaves sometimes faulty if a textarea was resized)
            SelectorCache.FileInput.style.width   = "";
            SelectorCache.FileInput.style.height  = "";
            SelectorCache.FileOutput.style.width  = "";
            SelectorCache.FileOutput.style.height = "";
        };
        // endregion

        // region custom editor example handling
        editorSession.on( "change", function()
        {
            if( !editorFocused ) { return; }
            editorChanged = true;
        } );

        editor.on( "focus", function()
        {
            editorFocused = true;
        } );

        editor.on( "blur", function()
        {
            editorFocused = false;
            if( !editorChanged ) { return; }

            customExampleUsed = editorSession.getValue() !== "";

            if(customExampleUsed)
            {
                SelectorCache.ExampleEditorBox.classList.add( "custom" );
            }
            else
            {
                SelectorCache.ExampleEditorBox.classList.remove( "custom" );
            }

            editorChanged = false;
        } );
        // endregion

        // region drag&drop + input[type:file]
        SelectorCache.ConfigInput.ondragover = handleDragOver;
        SelectorCache.ConfigInput.ondrop = function( e ){
            handleFileSelect( e, setConfigInputText );
        };
        SelectorCache.FileInputConfig.onchange = function( e ){
            handleFileSelect( e, setConfigInputText );
        };

        SelectorCache.FileInput.ondragover = handleDragOver;
        SelectorCache.FileInput.ondrop = function( e ){
            handleFileSelect( e, setFileInputText );
        };
        SelectorCache.FileInputFile.onchange = function( e ){
            handleFileSelect( e, setFileInputText );
        };

        SelectorCache.SaveConfig.onclick = function(){
            fileSaver.saveAs( new Blob( [SelectorCache.ConfigOutput.value], { type : 'text' } ), "uncrustify.cfg", false);
        };
        SelectorCache.SaveFileFormated.onclick = function(){
            fileSaver.saveAs( new Blob( [SelectorCache.FileOutput.value], { type : 'text' } ), "formated", false);
        };
        // endregion
    }

    const ViewModel = new GroupOptionsViewModel();
    buildModel();
    ko.applyBindings( ViewModel );

    assignEvents();

    document.getElementById("version").innerHTML = Uncrustify.get_version();
}

