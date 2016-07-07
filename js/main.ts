/** Daniel Chumak | uncrustify_config v0.1.0 | GPLv2+ License 
    github.com/CDanU/uncrustify_config */


/// <reference path="../typings/ace.d.ts" />
/// <reference path="../typings/knockout.d.ts" />
/// <reference path="../typings/libUncrustify.d.ts" />
/// <reference path="../typings/map.d.ts" />


type HTMLElementValue    = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
type OptionPrimitiveType = string | boolean | number;


module uncrustify_config
{
    const Uncrustify: LibUncrustify.Uncrustify = libUncrustify();
    Uncrustify.set_quiet();

    const editor        = ace.edit( "exampleEditorBox" );
    editor.$blockScrolling = Infinity;
    const editorSession = editor.getSession();
    editor.setShowInvisibles( true );
    editor.setShowPrintMargin( true );
    editorSession.setTabSize( 8 );
    editor.setFontSize( "12pt" );

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
        export const FileInput  = < HTMLTextAreaElement > document.getElementById( "fileInput" );
        export const FileOutput = < HTMLTextAreaElement > document.getElementById( "fileOutput" );
        export const FileOutputIsFragment = < HTMLInputElement > document.getElementById( "fileOutputIsFragment" );

    }

    enum TabStates
    {
        readConfigFile   = 0,
        editConfig       = 1,
        outputConfigFile = 2,
        fileIO = 3,
    }

    const dependencyMap = new Map< string, string[] >([
        ["output_tab_size", ["align_with_tabs"]],
        ["indent_namespace_single_indent", ["indent_namespace"]],
        ["indent_namespace_level", ["indent_namespace", "indent_namespace_single_indent"]],
        ["indent_namespace_limit", ["indent_namespace_level"]],
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
        arith,
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
`namespace ns0{
void func0();
namespace ns1{
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
`const auto A0 = 1 + 2;
const auto A1 = 1 - 2;
const auto A2 = 1 / 2;
const auto A3 = 1 * 2;
const auto A4 = 1 >> > 2;
const auto A5 = 1 << 2;
const auto A6 = 1 >> 2;
const auto A7 = 1 % 2;
const auto A8 = 1 | 2;` ],

    ] );

    const optionNameString_Map = new Map<string, string>( [
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
        ["sp_arith", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["tok_split_gte", exampleStringEnum_string_Map.get( ExampleStringEnum.example2) ],
        ["utf8_bom", exampleStringEnum_string_Map.get( ExampleStringEnum.noExample) ],
        ["utf8_byte", exampleStringEnum_string_Map.get( ExampleStringEnum.noExample) ],
        ["utf8_force", exampleStringEnum_string_Map.get( ExampleStringEnum.noExample) ],
    ] );

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
    //==========================================================================

    let modelBuild: boolean  = false;
    // initialy set to true to catch the case where a page reload does not clear the text
    // but no change event is fired
    let configInputChanged: boolean = true;
    let editorOpened: boolean       = false;
    let configOutputOpened: boolean = false;

    class Options
    {
        public name: string;
        public type: EmscriptenEnumTypeObject;
        public value: KnockoutObservable<OptionPrimitiveType>;
        // initially stored as strings, later converted to Options
        public dependencies;
        public example: string;
        public description: string;
        public descriptionCallback: Function;
        public changeCallback: Function;

        constructor( name: string, type: EmscriptenEnumTypeObject, value: OptionPrimitiveType,
                     description: string, dependencies: string[], example: string )
        {
            this.name         = name;
            this.type         = type;
            this.value        = ko.observable( value );
            this.description  = description;
            this.dependencies = dependencies;
            this.example      = example;
            // -----------------------------------------------------------------
            this.descriptionCallback = function()
            {
                setDescription( this.description );
                return true;
            };
            this.changeCallback = optionChange;
        }
    }

    class OptionsGroup
    {
        public name: string;
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
        public groups: KnockoutObservableArray<OptionsGroup>;
        public isFragment: KnockoutObservable<boolean>;
        public fileLang: KnockoutObservable<string>;
        public lookupMap = new Map<string, Options>();
        public AT_IARF = ['ignore', 'add', 'force', 'remove',];
        public AT_POS  = ['ignore', 'join', 'lead', 'lead_break', 'lead_force', 'trail', 'trail_break', 'trail_force',];
        public AT_LINE = ['auto', 'lf', 'crlf', 'cr',];
        public langFlagStrings = langFlagsStrings;
        //----------------------------------------------------------------------
        
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

        //private fillLookupMap( group: OptionsGroup )
        //{
        //    for( let option of group.options )
        //    {
        //        this.lookupMap.set( option.name, option );
        //    }
        //}

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

    function openTab( nr: number ): boolean
    {
        // TODO: set active class
        if( isNaN(nr) || nr < 0 || nr >= SelectorCache.TabContainers.length )
        {
            return false;
        }

        // manage visibility of tab containers
        for( let elem of SelectorCache.TabContainers )
        {
            elem.style.display = "none";
        }

        SelectorCache.TabContainers[nr].style.display = "flex";


        if( nr != TabStates.readConfigFile )
        {
            if( configInputChanged )
            {
                loadSettings( SelectorCache.ConfigInput );
                configInputChanged = false;
            }
        }
        switch( nr )
        {
            case TabStates.editConfig:
            {
                editorOpened = true;
                break;
            }

            case TabStates.outputConfigFile:
            {
                if( editorOpened ) { loadSettingsFromModel(); }
                printSettings();
                configOutputOpened = true;
                break;
            }

            case TabStates.fileIO:
            {
                if( configOutputOpened )
                {
                    loadSettings( SelectorCache.ConfigOutput );
                }
                else if( editorOpened ) { loadSettingsFromModel(); }
                break;
            }


            default:
            {
                break;
            }
        }

        return true;
    }

    function loadSettings( target: HTMLElementValue ): void
    {
        Uncrustify.loadConfig( target.value );
        updateModel();
    }

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

    function printSettings(): void
    {
        const optionDoc: boolean = SelectorCache.ConfigOutputWithDoc.checked;
        const optionDef: boolean = SelectorCache.ConfigOutputOnlyNDefault.checked;
        SelectorCache.ConfigOutput.value = Uncrustify.show_config( optionDoc, optionDef );
    }

    function initUncrustify(): void
    {
        if( initialized ) { return; }

        Uncrustify.initialize();
        initialized = true;
    }

    // returns true to sim html element default event handling
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
        // ----

        // write formated text to editor
        editorSession.setValue( Uncrustify.uncrustify( option.example ) );

        return true;
    }

    function buildModel()
    {
        if( modelBuild ) { return; }

        const groupEnumValues = Uncrustify.uncrustify_groups;
        const group_map       = Uncrustify.getGroupMap();
        const option_name_map = Uncrustify.getOptionNameMap();
        let   groupsArr: OptionsGroup[] = [];

        // enumVal : string, enum option name
        for( let enumVal in groupEnumValues )
        {
            if( enumVal === "values" ) { continue; }

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

                const option_object:Options = new Options( option_map_value.name,
                                                           option_map_value.type,
                                                           option_setting,
                                                           option_map_value.name + ": " + option_map_value.short_desc + "\n" + option_map_value.long_desc,
                                                           dependencies, example );

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

    function setDescription( text: string )
    {
        SelectorCache.ConfigDescriptionBox.value = text;
    }

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

        Uncrustify.set_language( langEnumObj );
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

        SelectorCache.ConfigOutput.onchange = function()
        {
            loadSettings( SelectorCache.ConfigOutput );
        };

        SelectorCache.ConfigOutputWithDoc.onchange      = printSettings;
        SelectorCache.ConfigOutputOnlyNDefault.onchange = printSettings;
        SelectorCache.FileInput.onchange = formatFile;

        ViewModel.isFragment.subscribe( formatFile );
        ViewModel.fileLang.subscribe( formatFile );
    }


    const ViewModel = new GroupOptionsViewModel();
    initUncrustify();
    buildModel();
    ko.applyBindings( ViewModel );

    assignEvents();
}
