/** Daniel Chumak | uncrustify_config v0.1.0 | GPLv2+ License 
    github.com/CDanU/uncrustify_config */


/// <reference path="../typings/ace.d.ts" />
/// <reference path="../typings/knockout.d.ts" />
/// <reference path="../typings/require.d.ts" />


type HTMLElementValue    = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
type OptionPrimitiveType = string | boolean | number;


type OptionElem = HTMLInputElement | HTMLSelectElement;
type OptionElemList = NodeListOf<OptionElem>;
type ObjectOrNone = Object | undefined;


module uncrustify_config
{
    const editor : AceAjax.Editor = ace.edit("exampleEditorBox");
    const editorSession = editor.getSession();
    editor.setShowInvisibles( true );
    editor.setShowPrintMargin( true );
    editor.setTheme("./ace/theme/solarized_dark");
    editorSession.setTabSize( 8 );
    editor.setFontSize( "12pt" );

    let initialized:boolean        = false;
    let menuBuild:boolean          = false;
    let configInputChanged:boolean = true; // first time always process input
    let fileInputChanged:boolean   = true; // first time always process input

    namespace SelectorCache
    {
        export const TabContainers: HTMLElement[] = [
            document.getElementById( "tab0" ),
            document.getElementById( "tab1" ),
            document.getElementById( "tab2" ),
            document.getElementById( "tab3" ),
            document.getElementById( "tab4" ),
        ];
        export const Tabs = < NodeListOf < HTMLElement > > document.querySelectorAll( "nav div" );
        export const ConfigInput          = < HTMLTextAreaElement > document.getElementById( "configInput" );
        export const ConfigInputButton    = <HTMLButtonElement> document.getElementById( "configInputButton" );
        export const ConfigDescriptionBox = < HTMLTextAreaElement > document.getElementById( "configDescriptionBox" );
        export const ConfigOutput = < HTMLTextAreaElement > document.getElementById( "configOutput" );
        export const ConfigOutputWithDoc      = < HTMLInputElement > document.getElementById( "configOutputWithDoc" );
        export const ConfigOutputOnlyNDefault = < HTMLInputElement > document.getElementById( "configOutputOnlyNDefault" );
        export const FileInput  = < HTMLTextAreaElement > document.getElementById( "fileInput" );
        export const FileOutput = < HTMLTextAreaElement > document.getElementById( "fileOutput" );
        export const FileOutputIsFragment = < HTMLInputElement > document.getElementById( "fileOutputIsFragment" );

    }

    enum TabStates
    {
        readConfigFile   = 0,
        editConfig       = 1,
        outputConfigFile = 2,
        fileInput        = 3,
        fileOutput       = 4,
    }

    const dependencyMap = new Map< string, string[] >([
        ["output_tab_size", ["align_with_tabs"]],
        ["indent_namespace_single_indent", ["indent_namespace"]],
        ["indent_namespace_level", ["indent_namespace","indent_namespace_single_indent"]],
        ["indent_namespace_limit", ["indent_namespace","indent_namespace_single_indent","indent_namespace_level"]],
    ]);

    enum ExampleStringEnum
    {
        noExample,
        noExampleYet,
        example1,
        example2,
        indentBraces,
        example4,
        multiNamespace,
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
`namespace n{
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
} }` ],
[ ExampleStringEnum.multiNamespace,
`namespace ns0
{
        namespace ns1
        {
            //comment1
            if(true)
            {
                return lFunc(a);
            }
        }
}` ],
    ] );

    const optionNameString_Map = new Map<string, string>( [``
        ["disable_processing_cmt", exampleStringEnum_string_Map.get( ExampleStringEnum.noExample) ],
        ["enable_processing_cmt", exampleStringEnum_string_Map.get( ExampleStringEnum.noExample) ],
        ["indent_brace_parent", exampleStringEnum_string_Map.get( ExampleStringEnum.indentBraces) ],
        ["indent_braces_no_class", exampleStringEnum_string_Map.get( ExampleStringEnum.indentBraces) ],
        ["indent_braces_no_func", exampleStringEnum_string_Map.get( ExampleStringEnum.indentBraces) ],
        ["indent_braces_no_struct", exampleStringEnum_string_Map.get( ExampleStringEnum.indentBraces) ],
        ["indent_brace", exampleStringEnum_string_Map.get( ExampleStringEnum.indentBraces) ],
        ["indent_columns", exampleStringEnum_string_Map.get( ExampleStringEnum.indentBraces) ],
        ["indent_continue", exampleStringEnum_string_Map.get( ExampleStringEnum.indentBraces) ],
        ["indent_namespace_level", exampleStringEnum_string_Map.get( ExampleStringEnum.multiNamespace) ],
        ["indent_namespace_limit", exampleStringEnum_string_Map.get( ExampleStringEnum.multiNamespace) ],
        ["indent_namespace_single_indent", exampleStringEnum_string_Map.get( ExampleStringEnum.multiNamespace) ],
        ["indent_namespace", exampleStringEnum_string_Map.get( ExampleStringEnum.multiNamespace) ],
        ["indent_with_tabs", exampleStringEnum_string_Map.get( ExampleStringEnum.indentBraces) ],
        ["input_tab_size", exampleStringEnum_string_Map.get( ExampleStringEnum.example1) ],
        ["newlines", exampleStringEnum_string_Map.get( ExampleStringEnum.indentBraces) ],
        ["output_tab_size", exampleStringEnum_string_Map.get( ExampleStringEnum.example1) ],
        ["sp_arith", exampleStringEnum_string_Map.get( ExampleStringEnum.noExampleYet) ],
        ["tok_split_gte", exampleStringEnum_string_Map.get( ExampleStringEnum.example2) ],
        ["utf8_bom", exampleStringEnum_string_Map.get( ExampleStringEnum.noExample) ],
        ["utf8_byte", exampleStringEnum_string_Map.get( ExampleStringEnum.noExample) ],
        ["utf8_force", exampleStringEnum_string_Map.get( ExampleStringEnum.noExample) ],
    ] );
    //==========================================================================

    function openTab( nr: number ): boolean
    {
        //TODO: set active class
        if( nr < 0 || nr >= SelectorCache.TabContainers.length )
        {
            return false;
        }

        // manage visibility of tab containers
        for( let elem of SelectorCache.TabContainers )
        {
            elem.style.display = "none";
        }
        SelectorCache.TabContainers[nr].style.display = "flex";
        // --

        initUncrustify();

        switch( nr )
        {
            case TabStates.editConfig:
            {
                // loads settings only to set the menu accordingly
                if( configInputChanged )
                {
                    loadSettings();
                }

                if( !menuBuild )
                {
                    buildMenu();
                }
                else if( configInputChanged )
                {
                    updateMenu();
                    configInputChanged = false;
                }

                break;
            }

            case TabStates.outputConfigFile:
            {
                // loads config via the menu settings
                loadSettingsFromMenu();
                printSettings();

                break;
            }
            case TabStates.fileOutput:
            {
                if( fileInputChanged )
                {
                    formatFile();
                    fileInputChanged = false;
                }
                break;
            }
            default:
            {
                break;
            }
        }

        return true;
    }

    function loadSettings():void
    {
        console.log( "loadSettings()" );
        Uncrustify.loadConfig( SelectorCache.ConfigInput.value );
    }

    function loadSettingsFromMenu():void
    {
        const targets:OptionElemList = <OptionElemList> SelectorCache.configMenuBox.querySelectorAll( "input,select" );
        const targetsLen:number      = targets.length;

        for( let i:number = 0; i < targetsLen; i++ )
        {
            if( targets[ i ].type === "checkbox" )
            {
                Uncrustify.set_option( targets[ i ].name, targets[ i ].checked === true ? "true" : "false" );
            }
            else
            {
                Uncrustify.set_option( targets[ i ].name, targets[ i ].value );
            }
        }
    }

    function printSettings(): void
    {
        const optionDoc: boolean = SelectorCache.ConfigOutputWithDoc.checked;
        const optionDef: boolean = SelectorCache.ConfigOutputOnlyNDefault.checked;
        SelectorCache.ConfigOutput.value = Uncrustify.show_config( optionDoc, optionDef );
    }

    function initUncrustify(): void
    {
        if( !initialized )
        {
            Uncrustify.initialize();
            initialized = true;
        }
    }

    function optionChange( e:Event ):void
    {
        // get example string
        const example:string = optionNameString_Map.get( e.target.name );
        if( example == null )
        {
            console.error("did not found option: "+e.target.name);
            return;
        }
        const optionValue:string = ( e.target.type === "checkbox" ) ? ( e.target.checked ? "true" : "false" ) : e.target.value;

        // reset all uncrustify options to default values
        Uncrustify.set_option_defaults();

        // set changed option
        Uncrustify.set_option( e.target.name, optionValue );

        // set the dependencies of the option
        const dependencies = dependencyMap.get( e.target.name );
        if( dependencies != null )
        {
            for( let dependency of dependencies )
            {
                const target = SelectorCache.configMenuBox.querySelector( "input[name="+dependency+"],select[name="+dependency+"]" );
                if( target == null )
                {
                    console.error("did not found option input or select element with option name: "+dependency);
                    continue;
                }
                const targetValue = ( target.type === "checkbox" ) ? ( target.checked ? "true" : "false" ) : target.value;

                Uncrustify.set_option( dependency, targetValue );
            }
        }

        console.log( Uncrustify.show_config( false, true ) );

        // write formated text to editor
        editorSession.setValue( Uncrustify.uncrustify( example ) );
    }

    function buildMenu()
    {
        if( menuBuild ) { return; }

        const groupEnumValues:Object[] = Uncrustify.uncrustify_groups;
        const group_map       = Uncrustify.getGroupMap();
        const option_name_map = Uncrustify.getOptionNameMap();

        for( let enumVal in groupEnumValues )
        {
            if( enumVal === "values" ) { continue; }

            const groupMapVal:ObjectOrNone = group_map.get( groupEnumValues[ enumVal ] );
            if( groupMapVal == null  ) { continue; }

            let groupDiv:HTMLDivElement    = document.createElement( "div" );
            let groupH3:HTMLHeadingElement = document.createElement( "h3" );
            let groupUL:HTMLUListElement   = document.createElement( "ul" );

            groupH3.innerHTML = groupMapVal.id.constructor.name;

            const groupOptions    = groupMapVal.options;
            const groupOptionsLen = groupOptions.size();

            for( let i = 0; i < groupOptionsLen; i++ )
            {
                const option = groupOptions.get( i );
                if( option == null ) { continue; }
                //console.log( option );

                const optionMapVal:ObjectOrNone = option_name_map.get( option );
                if( optionMapVal == null ) { continue; }
                //console.log( optionMapVal );

                let optionLi:HTMLLIElement = document.createElement( "li" );

                let optionLabel:HTMLLabelElement = document.createElement( "label" );
                optionLabel.innerHTML            = optionMapVal.name;

                let optionInput:OptionElem;
                switch( optionMapVal.type )
                {
                    case Uncrustify.argtype_e.AT_IARF:
                    {
                        const optionStrings = [ "ignore", "add", "remove", "force" ];
                        optionInput         = document.createElement( "select" );

                        //Create and append the options
                        for( let optionString of optionStrings )
                        {
                            let option   = document.createElement( "option" );
                            option.value = optionString;
                            option.text  = optionString;
                            optionInput.appendChild( option );
                        }
                        break;
                    }
                    case Uncrustify.argtype_e.AT_BOOL:
                    {
                        optionInput       = document.createElement( "input" );
                        optionInput.type  = "checkbox";
                        optionInput.value = "false";
                        break;
                    }
                    case Uncrustify.argtype_e.AT_NUM:
                    {
                        optionInput       = document.createElement( "input" );
                        optionInput.type  = "number";
                        optionInput.value = "0";
                        break;
                    }
                    case Uncrustify.argtype_e.AT_POS:
                    {
                        const optionStrings = [ "ignore", "join", "lead", "lead_break", "lead_force", "trail", "trail_break", "trail_force" ];
                        optionInput         = document.createElement( "select" );

                        //Create and append the options
                        for( let optionString of optionStrings )
                        {
                            let option   = document.createElement( "option" );
                            option.value = optionString;
                            option.text  = optionString;
                            optionInput.appendChild( option );
                        }
                        break;
                    }
                    case Uncrustify.argtype_e.AT_STRING:
                    {
                        optionInput      = document.createElement( "input" );
                        optionInput.type = "text";
                        break;
                    }
                    case Uncrustify.argtype_e.AT_LINE:
                    {
                        const optionStrings = [ "auto", "lf", "crlf", "cr" ];
                        optionInput         = document.createElement( "select" );

                        //Create and append the options
                        for( let optionString of optionStrings )
                        {
                            let option   = document.createElement( "option" );
                            option.value = optionString;
                            option.text  = optionString;
                            optionInput.appendChild( option );
                        }
                        break;
                    }
                    default:
                    {
                        continue;
                    }
                }
                optionInput.name = optionMapVal.name;

                if( optionInput.type === "checkbox" )
                {
                    optionInput.checked = Uncrustify.get_option( optionMapVal.name ) === "true";
                }
                else
                {
                    optionInput.value = Uncrustify.get_option( optionMapVal.name );
                }
                optionInput.onchange = optionChange;
                optionLi.onclick     = function()
                {
                    setDescription( optionMapVal.name + ": " + optionMapVal.short_desc + "\n" + optionMapVal.long_desc );
                };

                optionLi.appendChild( optionLabel );
                optionLi.appendChild( optionInput );
                groupUL.appendChild( optionLi );
            }

            groupDiv.appendChild( groupH3 );
            groupDiv.appendChild( groupUL );

            SelectorCache.configMenuBox.appendChild( groupDiv );
        }

        menuBuild = true;
    }

    function updateMenu()
    {
        const targets:OptionElemList = <OptionElemList> SelectorCache.configMenuBox.querySelectorAll( "input,select" );
        const targetsLen:number = targets.length;

        for( let i:number = 0; i < targetsLen; i++ )
        {
            if( targets[ i ].type === "checkbox" )
            {
                targets[ i ].checked = Uncrustify.get_option( targets[ i ].name ) === "true";
            }
            else
            {
                targets[ i ].value = Uncrustify.get_option( targets[ i ].name );
            }
        }
    }

    function setDescription( text: string )
    {
        SelectorCache.ConfigDescriptionBox.value = text;
    }

    function formatFile()
    {
        const isFrag:boolean = SelectorCache.FileOutputIsFragment.checked;
        console.log( Uncrustify.show_config( false, true ) );
        SelectorCache.FileOutput.value = Uncrustify.uncrustify( SelectorCache.FileInput.value, isFrag );
    }

    function assignEvents()
    {
        const tabLen: number = SelectorCache.Tabs.length;
        for( let i: number = 0; i < tabLen; i++ )
        {
            SelectorCache.Tabs[i].onclick = () => openTab( i );
        }

        SelectorCache.ConfigInput.onchange = function()
        {
            configInputChanged = true; // see configInputChanged desc
        };
        SelectorCache.ConfigOutputWithDoc.onchange      = printSettings;
        SelectorCache.ConfigOutputOnlyNDefault.onchange = printSettings;

        SelectorCache.FileInput.onchange = function()
        {
            console.log( "FileInput.onchange()" );
            fileInputChanged = true;
        };
    }

    assignEvents();
    openTab(1);
}
