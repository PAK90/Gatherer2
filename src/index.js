import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import "searchkit/theming/theme.scss";
import "./styles/customisations.scss";
var VelocityTransitionGroup = require('velocity-react/velocity-transition-group.js');
var VelocityComponent = require('velocity-react/velocity-component.js');
var VelocityHelpers = require('velocity-react/velocity-helpers.js');
require('velocity-animate/');
require('velocity-animate/velocity.js');
require('velocity-animate/velocity.ui.js');
var ent = require('ent');
const nl2br = require('react-nl2br');
const omit = require("lodash/omit");
const map = require("lodash/map");


import {
  SearchBox,
  Hits,
  HitsStats,
  Pagination,
  ResetFilters,
  MenuFilter,
  SelectedFilters,
  GroupedSelectedFilters,
  HierarchicalMenuFilter,
  NumericRefinementListFilter,
  SortingSelector,
  SearchkitComponent,
  SearchkitProvider,
  SearchkitManager,
  FastClick,
  Panel,
  NoHits,
  TagFilter,
  InputFilter,
  PageSizeSelector,
  Select, Toggle,
  RangeFilter,
  ItemHistogramList,
  InitialLoader,
  ViewSwitcherHits,
  ViewSwitcherToggle,
  DynamicRangeFilter,
  FilterGroup, FilterGroupItem
} from "searchkit";
import {RefinementListFilter} from './modRefineListFilter.js';
import CardDetailPanel from './CardDetailPanel';
import CardHitsListItem from './CardHitsListItem';
import CardHitsGridItem from './CardHitsGridItem';
import CostSymbols from './costSymbols';
import {MultiSelect} from './MultiSelect';
//console.log("multiselect is " + MultiSelect);

String.prototype.replaceAll = function(s,r){return this.split(s).join(r)};

// Register animations here so that 'stagger' property can be used with them.
var Animations = {
    In: VelocityHelpers.registerEffect({
        calls: [
            [{
                transformPerspective: [ 800, 800 ],
                transformOriginX: [ '50%', '50%' ],
                transformOriginY: [ '100%', '100%' ],
                marginBottom: 10,
                opacity: 1,
                rotateX: [0, 130],
            }, 1, {
                easing: 'ease-out',
                display: 'block',
            }]
        ],
    }),
    Out: VelocityHelpers.registerEffect({
        calls: [
            [{
                transformPerspective: [ 800, 800 ],
                transformOriginX: [ '50%', '50%' ],
                transformOriginY: [ '0%', '0%' ],
                marginBottom: -30,
                opacity: 0,
                rotateX: [-70],
            }, 1, {
                easing: 'ease-out',
                display: 'block',
            }]
        ],
    })
};



function imageFromColor(color){
  color = color.toLowerCase()
  if (color == "blue") color = "u";
  else if (color.length > 2) color = color[0]; // Keep 2-letter keys (hw, gw, etc.)
  return './src/img/' + color + '.png'
}

class FilterGroupItemImg extends FilterGroupItem {
  render() {
    const { bemBlocks, label, itemKey } = this.props

    return (
      <FastClick handler={this.removeFilter}>
        <div className={bemBlocks.items("value") } data-key={itemKey}>
          <img src={imageFromColor(label)} alt={label} />
        </div>
      </FastClick>
    )
  }
}

class FilterGroupItemCost extends FilterGroupItem {
  render() {
    const { bemBlocks, label, itemKey } = this.props

    return (
      <FastClick handler={this.removeFilter}>
        <div className={bemBlocks.items("value") } data-key={itemKey}>
          <CostSymbols cost={label} />
        </div>
      </FastClick>
    )
  }
}

class FilterGroupImg extends FilterGroup {
  
  renderFilter(filter, bemBlocks) {
    const { translate, removeFilter, title } = this.props
    const id = filter.id
    if ((id == "symbols") || (id == "colours") || (id == "colourIdentity")) {
      return (
        <FilterGroupItemImg key={filter.value}
                    itemKey={filter.value}
                    bemBlocks={bemBlocks}
                    filter={filter}
                    label={translate(filter.value)}
                    removeFilter={removeFilter} />
      ) 
    } else if (id == "manaCost") {
      return (
        <FilterGroupItemCost key={filter.value}
                    itemKey={filter.value}
                    bemBlocks={bemBlocks}
                    filter={filter}
                    label={translate(filter.value)}
                    removeFilter={removeFilter} />
      ) 
    } else {
      return super.renderFilter(filter, bemBlocks)
    }
  }
}

function generateTitleCostSymbols(source) {
  // Take the manacost and return a bunch of img divs.
  var tagged;
  if (source !== undefined) {
    source = source.replace(/\//g,''); // Get rid of / in any costs first.
    // Check that match returns anything.
    if (source.match(/\{([0-z,½,∞]+)\}/g)) {
      tagged = source.match(/\{([0-z,½,∞]+)\}/g)
      .map(function (basename, i) {
          var src = './src/img/' + basename.substring(1, basename.length - 1).toLowerCase() + '.png';
          return <img key={i} src={src} height='15px'/>;
      });
    }
  }
  return tagged;
}

function generateTextCostSymbols(source) {
  var tagged;
  if (source !== undefined) {
    // Get rid of / in any costs first, but only if inside {} brackets (so as not to affect +1/+1).
    source = source.replace(/(\/)(?=\w\})/g,'');
    // Then generate the tags through setting the innerHtml. This is the only way to preserve the text around the img tags.
    // Encode the source in html, to prevent XSS nastiness. Then replace the newlines with <br/>. Then insert the <img> tags.
    tagged = <div dangerouslySetInnerHTML={{__html: ent.encode(source).replace(/&#10;/g, '<br/>').replace(/\{([0-z,½,∞]+)\}/g, (fullMatch, firstMatch) =>
        `<img src=./src/img/${firstMatch.toLowerCase()}.png height=12px/>`
      )}}></div>
  }
  return tagged;
}

// The mana symbol refinement list.
const SymbolRefineList = (props:FilterItemComponentProps)=> {
  const showCheckbox = false
  const {bemBlocks, onClick, translate, active, label, count} = props;
  const block = bemBlocks.option;
  const className = block()
                    .state({active})
                    .mix(bemBlocks.container("item"));
  return (
    <FastClick handler={onClick}>
      <div className={className} data-qa="option">
        {showCheckbox ? <input type="checkbox" data-qa="checkbox" checked={active} readOnly className={block("checkbox").state({ active }) } ></input> : undefined}
        <img src = {imageFromColor(props.label)} className="refineListImage"/>
        <div data-qa="count" className={block("count")}>{count}</div>
      </div>
    </FastClick>
  )
}

const SetRefineList = (props:FilterItemComponentProps, showCheckbox)=> {
  const {bemBlocks, onClick, translate, active, label, count} = props;
  const block = bemBlocks.option;
  const className = block()
                    .state({active})
                    .mix(bemBlocks.container("item"));
  // objectFit: contain is to preserve the shape of the set icons; otherwise they got distorted.
  return (
    <FastClick handler={onClick}>
      <div className={className} data-qa="option">
        {showCheckbox ? <input type="checkbox" data-qa="checkbox" checked={active} readOnly className={block("checkbox").state({ active }) } ></input> : undefined}
        <img src = {'./src/img/sets/' + props.label.replace(/\s+/g,'').replace(":","").replace('"','').replace('"','').toLowerCase() + '-R.jpg'}
          style={{objectFit: 'contain', padding: '2px'}} />
        <div data-qa="label" className={block("text")}>{label}</div>
        <div data-qa="count" className={block("count")} style={{flex:'1'}}>{count}</div>
      </div>
    </FastClick>
  )
}

const InitialLoaderComponent = (props) => {
  /*const {bemBlocks} = props;
  const block = bemBlocks.option;
  const className = block()
                    .mix(bemBlocks.container("item"));*/
  return <div >
    loading please wait...
  </div>
}


const CostMultiSelect = <MultiSelect 
  valueRenderer={(option) => <CostSymbols cost={option.value} />}
  optionRenderer={(option) => <span><CostSymbols cost={option.value} /> ({option.doc_count})</span>}
   />

export class App extends React.Component<any, any> {

  constructor() {
    super();
    const host = "http://localhost:9200/cards/card";
    this.searchkit = new SearchkitManager(host);
    this.state = {hoveredId: '',
      clickedCard: '',
      matchPercent: '100%',
      operator: "AND",
      all: 'collapse'};
  }

  hide() {
    this.setState({clickedCard: ''});
  }

  handleClick(source) {
    // If clicked on a different card, change the name.
    if (this.state.clickedCard != source.name)
    {
      this.setState({clickedCard: source.name});
    }
    // Else, we clicked on the same card, so shrink.
    else {
      this.setState({clickedCard: ''});
    }
    //document.addEventListener("click", this.hide.bind(this));
  }

  handleHoverIn(source) {
    this.setState({hoveredId: source.id});
  }

  handleHoverOut(source) {
    this.setState({hoveredId: ''});
  }

  handleOperatorChange(e){
    this.setState({operator: e.target.value})
  }

  getSetIcons(source) {
    // Loop through all multiverseIds, which have their own set code and rarity.
    var setImages = source.multiverseids.map(function(multis, i) {
      let rarity = multis.rarity.charAt(0) == "B" ? "C" : multis.rarity.charAt(0); // Replace 'basic' rarity with common.
      let url = "http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=" + multis.multiverseid;
      return (
              <img className='setIcon' src={'./src/img/sets/' + multis.setName.replace(/\s+/g,'').replace(":","").replace('"','').replace('"','').toLowerCase() + '-' + rarity + '.jpg'} 
                title={multis.setName}
                style={{padding: '2px'}}
                onClick={this.handleClick.bind(this, source)}/>
               )
    }.bind(this))
    return setImages;
  }

  CardHitsGridItem = (props)=> {
    const {bemBlocks, result} = props;
    const source = result._source;
    let url = "http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=" + result._source.multiverseids[result._source.multiverseids.length - 1].multiverseid;
    let imgUrl = 'https://image.deckbrew.com/mtg/multiverseid/' + result._source.multiverseids[result._source.multiverseids.length - 1].multiverseid + '.jpg';
    //let imgUrl = '../cropped2/crops' + result._source.multiverseids[result._source.multiverseids.length - 1].multiverseid + '.jpg';
    return (
      <div className={bemBlocks.item().mix(bemBlocks.container("item"))}>
          <img className='gridaImg' 
            style={{height: 311}} 
            src={imgUrl} 
            onClick={this.handleClick.bind(this, source)}
            onMouseOver={this.handleHoverIn.bind(this, source)}
            onMouseOut={this.handleHoverOut.bind(this, source)}/>
      </div>
    )
  }

  render() {
    return (
      <div>
      <SearchkitProvider searchkit={this.searchkit}>
      <div>
        <div className="sk-layout sk-layout__size-l">

          <div className="sk-layout__top-bar sk-top-bar">
            <div className="sk-top-bar__content">
              <div className="my-logo"><span>MtG:Hunter</span><br/>
              <a href="http://searchkit.co/" style={{textDecoration:"none"}}>
              <span className="my-logo-small">Made with Searchkit</span></a></div>
              <SearchBox
                translations={{"searchbox.placeholder": "search card names"}}
                queryOptions={{"minimum_should_match": this.state.matchPercent}}
                autofocus={true}
                searchOnChange={true}
                searchThrottleTime={500}
                queryFields={["name"]}/>
            </div>
          </div>

          <div className="sk-layout__body">

            <div className="sk-layout__filters">
              <RangeFilter id="cmc" min={0} max={16} title="Converted Cost" field="cmc" showHistogram={true}/>
              <select value={this.state.operator} onChange={this.handleOperatorChange.bind(this) }>
                <option value="AND">AND</option>
                <option value="OR">OR</option>
              </select>
              <InputFilter id="rulesText" searchThrottleTime={500} title="Rules text" placeholder="Search rules text" searchOnChange={true} queryOptions={{"minimum_should_match": this.state.matchPercent}} queryFields={["namelessText"]} />
              <InputFilter id="flavourText" searchThrottleTime={500} title="Flavour text" placeholder="Search flavour text" searchOnChange={true} queryOptions={{"minimum_should_match": this.state.matchPercent}} queryFields={["flavors"]} />
              <InputFilter id="typeLine" searchThrottleTime={500} title="Type text" placeholder="Search type text" searchOnChange={true} queryOptions={{"minimum_should_match": this.state.matchPercent}} queryFields={["type"]} />
              <InputFilter id="artistName" searchThrottleTime={500} title="Artist name" placeholder="Search artist name" searchOnChange={true} queryOptions={{"minimum_should_match": this.state.matchPercent}} queryFields={["artists.raw"]} />
              <RefinementListFilter id="power" title="Power" field="power.raw" size={5} operator={this.state.operator} containerComponent={<Panel collapsable={true} defaultCollapsed={true}/>}/>
              <RefinementListFilter id="toughness" title="Toughness" field="toughness.raw" size={5} operator={this.state.operator} containerComponent={<Panel collapsable={true} defaultCollapsed={true}/>}/>
              <RefinementListFilter id="symbols" title="Symbols" field="symbols" size={6} operator={this.state.operator} itemComponent={SymbolRefineList} containerComponent={<Panel collapsable={true} defaultCollapsed={true}/>}/>
              <RefinementListFilter id="manaCost" title="Mana Cost" field="prettyCost.raw" showMore={false} listComponent={CostMultiSelect} size={0} operator={this.state.operator} containerComponent={<Panel collapsable={true} defaultCollapsed={true}/>}/>
              <RefinementListFilter id="colours" title="Colours" field="colors.raw" size={6} operator={this.state.operator} itemComponent={SymbolRefineList} containerComponent={<Panel collapsable={true} defaultCollapsed={true}/>}/>
              <RefinementListFilter id="colourIdentity" title="Colour Identity" field="colorIdentity" size={6} operator={this.state.operator} itemComponent={SymbolRefineList} containerComponent={<Panel collapsable={true} defaultCollapsed={true}/>}/>
              <RefinementListFilter id="colourCount" title="Colour Count" field="colourCount" size={6} operator={this.state.operator} orderKey="_term" containerComponent={<Panel collapsable={true} defaultCollapsed={true}/>}/>
              <RefinementListFilter id="rarity" title="Rarity" field="rarities.raw" size={5} operator={this.state.operator} containerComponent={<Panel collapsable={true} defaultCollapsed={true}/>}/>
              <RefinementListFilter id="supertype" title="Supertype" field="supertypes.raw" size={5} operator={this.state.operator} containerComponent={<Panel collapsable={true} defaultCollapsed={true}/>}/>
              <RefinementListFilter id="type" title="Type" field="types.raw" size={5} operator={this.state.operator} containerComponent={<Panel collapsable={true} defaultCollapsed={true}/>}/>
              <RefinementListFilter id="subtype" title="Subtype" field="subtypes.raw" showMore={false} listComponent={MultiSelect} size={0} orderKey="_term" operator={this.state.operator} containerComponent={<Panel collapsable={true} defaultCollapsed={true}/>}/>
              <RefinementListFilter id="setcodes" title="Set" field="codeNames.raw" showMore={false} listComponent={MultiSelect} size={0} orderKey="_term" operator={this.state.operator} itemComponent={SetRefineList} containerComponent={<Panel collapsable={true} defaultCollapsed={true}/>}/>
              <RefinementListFilter id="formats" title="Formats" field="formats.raw" showMore={false} listComponent={MultiSelect} size={0} orderKey="_term" operator={this.state.operator} containerComponent={<Panel collapsable={true} defaultCollapsed={true}/>}/>
            </div>

            <div className="sk-layout__results sk-results-list">
              <div className="sk-results-list__action-bar sk-action-bar">
                <div className="sk-action-bar-row">
                  <HitsStats />
                  <ViewSwitcherToggle/>
                  <SortingSelector options={[
                    {label:"Name", field: "name.raw", order: "asc", defaultOption:true},
                    {label:"Relevance", field:"_score", order:"desc"},
                    {label:"Colour", field:"colors", order:"asc"},
                    {label:"Converted Cost", field:"cmc", order:"asc"}
                  ]} />
                  <PageSizeSelector options={[4,12,24]} listComponent={Toggle}/>
                </div>

                <div className="sk-action-bar__filters">
                  <GroupedSelectedFilters groupComponent={FilterGroupImg} />
                  <ResetFilters/>
                </div>

              </div>
                <ViewSwitcherHits
                    hitsPerPage={12}
                    hitComponents = {[
                      {key:"grid", title:"Grid", itemComponent:this.CardHitsGridItem},
                      {key:"list", title:"List", itemComponent:CardHitsListItem, defaultOption:true}
                    ]}
                    scrollTo="body"
                />
              <NoHits suggestionsField={"name"}/>
              <InitialLoader component={InitialLoaderComponent}/>
              <Pagination showNumbers={true}/>
            </div>
          </div>
        </div>
      </div>
      </SearchkitProvider>
      </div>
    )}
}

ReactDOM.render(<App />, document.getElementById('app'));
