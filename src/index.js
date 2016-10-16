import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import "searchkit/theming/theme.scss";
import "./styles/customisations.scss";
//import "./styles/keyrune.css";
import Webcam from "react-user-media";
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
import Modal from 'react-overlays/lib/Modal';

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
  RangeSliderHistogramInput,
  RangeSliderInput,
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
  FilterGroup, FilterGroupItem,
  TagFilterConfig, TagFilterList
} from "searchkit";
import {RefinementListFilter, OnlyRefinementListFilter} from './modRefineListFilter.js';
import CardDetailPanel from './CardDetailPanel';
import CardHitsListItem from './CardHitsListItem';
import CardHitsGridItem from './CardHitsGridItem';
import CostSymbols from './CostSymbols';
import {MultiSelect} from './MultiSelect';
import {TogglePanel} from './TogglePanel';
//console.log("multiselect is " + MultiSelect);

String.prototype.replaceAll = function(s,r){return this.split(s).join(r);};

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

const assign = require("lodash/assign");

export function QueryString(query, options:QueryStringOptions={}){
  if(!query){
    return;
  }
  return {
    "regexp":assign({"name":query})
  }
}

export function QueryRulesString(query, options:QueryStringOptions={}){
  if(!query){
    return
  }
  return {
    "regexp":assign({"reminderlessText":query})
  }
}

export function QueryFlavourString(query, options:QueryStringOptions={}){
  if(!query){
    return
  }
  return {
    "regexp":assign({"multiverseids.flavor":query})
  }
}

export function QueryTypeString(query, options:QueryStringOptions={}){
  if(!query){
    return;
  }
  return {
    "regexp":assign({"type":query})
  };
}

// Make a view switcher that accepts props.
class NewViewSwitcher extends ViewSwitcherHits {
  componentWillReceiveProps(nextProps){
        this.accessor.options = nextProps.hitComponents;
    }
}

function imageFromColor(color){
  color = color.toLowerCase();
  if (color == "blue") color = "u";
  else if (color.length > 2) color = color[0]; // Keep 2-letter keys (hw, gw, etc.)
  return './src/img/' + color + '.png';
}

class FilterGroupItemImg extends FilterGroupItem {
  render() {
    const { bemBlocks, label, itemKey } = this.props;

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
class FilterGroupItemSet extends FilterGroupItem {
  render() {
    const { bemBlocks, label, itemKey } = this.props

    return (
      <FastClick handler={this.removeFilter}>
        <div className={bemBlocks.items("value") } data-key={itemKey}>
          <img className='multiSetIcon' src={'./src/img/sets/' + label.replace(/\s+/g,'').replace(":","").replace('"','').replace('"','').toLowerCase() + '-R.jpg'}
    style={{padding: '0px'}}/> {label}
        </div>
      </FastClick>
    )
  }
}

class FilterGroupItemCycleSet extends FilterGroupItem {
  render() {
    const { bemBlocks, label, itemKey } = this.props

    return (
      <FastClick handler={this.removeFilter}>
        <div className={bemBlocks.items("value") } data-key={itemKey}>
          {generateCycleSetSymbols(label)}
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
    }
    else if (id == "manaCost") {
      return (
        <FilterGroupItemCost key={filter.value}
                    itemKey={filter.value}
                    bemBlocks={bemBlocks}
                    filter={filter}
                    label={translate(filter.value)}
                    removeFilter={removeFilter} />
      )
    }
    else if ((id == "setcodes")) {
      return (
        <FilterGroupItemSet key={filter.value}
                    itemKey={filter.value}
                    bemBlocks={bemBlocks}
                    filter={filter}
                    label={translate(filter.value)}
                    removeFilter={removeFilter} />
      )
    }
    else if ((id == "cycles")) {
      return (
        <FilterGroupItemCycleSet key={filter.value}
                    itemKey={filter.value}
                    bemBlocks={bemBlocks}
                    filter={filter}
                    label={translate(filter.value)}
                    removeFilter={removeFilter} />
      )
    }
    else {
      return super.renderFilter(filter, bemBlocks)
    }
  }
}

function generateCycleSetSymbols(source) {
  var tagged;
  if (source !== undefined) {
    // Then generate the tags through setting the innerHtml. This is the only way to preserve the text around the img tags.
    // Encode the source in html, to prevent XSS nastiness. Then replace the newlines with <br/>. Then insert the <img> tags.
    tagged = <span dangerouslySetInnerHTML={{__html: source.replace(/\b[A-Z0-9]{2,3}\b/g, (fullMatch, firstMatch) =>
        `<img src=./src/img/sets-codified/${fullMatch.toUpperCase()}-R.jpg /><span>${fullMatch}</span>`
      )}}></span>
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

const CycleRefineList = (props:FilterItemComponentProps)=> {
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
        <img src = {generateCycleSetSymbols(props.label)} className="refineListImage"/>
        <div data-qa="label" className={block("text")}>{label}</div>
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
    Loading, please wait...
  </div>
}

const CostMultiSelect = <MultiSelect
  valueRenderer={(option) => <CostSymbols cost={option.value} />}
  optionRenderer={(option) => <span><CostSymbols cost={option.value} /> ({option.doc_count})</span>}
   />

const SetMultiSelect = <MultiSelect
  valueRenderer={(option) => <img className='multiSetIcon' src={'./src/img/sets/' + option.value.replace(/\s+/g,'').replace(":","").replace('"','').replace('"','').toLowerCase() + '-R.jpg'}
    style={{padding: '0px'}}/>}
  optionRenderer={(option) => <span><img className='multiSetIcon' src={'./src/img/sets/' + option.value.replace(/\s+/g,'').replace(":","").replace('"','').replace('"','').toLowerCase() + '-R.jpg'}
    style={{padding: '0px'}}/> {option.value} ({option.doc_count})</span>}
   />

const CycleMultiSelect = <MultiSelect
  valueRenderer={(option) => generateCycleSetSymbols(option.value)}
  optionRenderer={(option) => <span style={{display:'inline-flex'}}>{generateCycleSetSymbols(option.value)}
    ({option.doc_count})</span>}
   />

const modalStyle = {
  position: 'fixed',
  zIndex: 1040,
  top: 0, bottom: 0, left: 0, right: 0
};

const backdropStyle = {
  ...modalStyle,
  zIndex: 'auto',
  backgroundColor: '#000',
  opacity: 0.5
};

const dialogStyle = function() {
  // we use some psuedo random coords so nested modals
  // don't sit right on top of each other.
  let top = 50 + Math.random();
  let left = 50 + Math.random();

  return {
    position: 'absolute',
    width: 400,
    top: top + '%', left: left + '%',
    transform: `translate(-${top}%, -${left}%)`,
    border: '1px solid #e5e5e5',
    backgroundColor: 'white',
    boxShadow: '0 5px 15px rgba(0,0,0,.5)',
    padding: 20
  };
};

export class App extends React.Component<any, any> {

  constructor() {
    super();
    const host = "http://localhost:9200/cards/card";
    this.searchkit = new SearchkitManager(host);
    this.state = {hoveredId: '',
      showModal: false,
      clickedCard: '',
      matchPercent: '100%',
      all: 'collapse',
      powerOperator: "AND",
      toughnessOperator: "AND",
      symbolsOperator: "AND",
      manaCostOperator: "AND",
      coloursOperator: "AND",
      colourIdentityOperator: "AND",
      colourCountOperator: "AND",
      rarityOperator: "AND",
      supertypeOperator: "AND",
      typeOperator: "AND",
      subtypeOperator: "AND",
      artistsOperator: "AND",
      setcodesOperator: "AND",
      formatsOperator: "AND",
      cyclesOperator: "AND",
      coloursOnly: false,
      colourIdentityOnly: false};
    // Bind the prop function to this scope.
    this.handleClick = this.handleClick.bind(this)
  }

  hide() {
    this.setState({clickedCard: ''});
  }

  handleClick(source) {
    // If clicked on a different card, change the name.
    if (this.state.clickedCard != source.name)
    {
      if (typeof ga !== 'undefined') {
        ga('send','event','List details','open', source.name); // Record this momentous occasion.
      }
      this.setState({clickedCard: source.name});
    }
    // Else, we clicked on the same card, so shrink.
    else {
      this.setState({clickedCard: ''});
    }
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

  handleToggleOperatorChange(state, e){
    // 'State' is the name of the state, and e is the new value.
    // Use a function to dynamically create the state to be set.
    var stateObject = function() {
      var returnObj = {};
      returnObj[state] = e;
      return returnObj;
    }
    this.setState(stateObject);
  }

  handleIdentityOnlyChange(e){
    this.setState({colourIdentityOnly: e.target.checked})
  }

  handleColourOnlyChange(e){
    this.setState({coloursOnly: e.target.checked})
  }

  close(){
    this.setState({ showModal: false });
  }

  open(){
    this.setState({ showModal: true });
  }


  CardHitsGridItem = (props)=> {
    const {bemBlocks, result} = props;
    const source = result._source;
    let url = "http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=" + result._source.multiverseids[result._source.multiverseids.length - 1].multiverseid;
    let imgUrl = 'https://image.deckbrew.com/mtg/multiverseid/' + result._source.multiverseids[result._source.multiverseids.length - 1].multiverseid + '.jpg';
    //let imgUrl = '../cropped2/crops' + result._source.multiverseids[result._source.multiverseids.length - 1].multiverseid + '.jpg';
    return (
      <div className={bemBlocks.item().mix(bemBlocks.container("item"))}>
        <a href={"http://mtg-hunter.com/?q="+source.name+"&sort=_score_desc"}>
          <img className='gridImg'
            style={{height: 311}}
            src={imgUrl}
            onClick={this.handleClick.bind(this, source)}
            onMouseOver={this.handleHoverIn.bind(this, source)}
            onMouseOut={this.handleHoverOut.bind(this, source)}/>
        </a>
      </div>
    )
  }

  CardHitsTable = (props)=> {
    const { hits } = props;

    function getSetIcons(source, scope) {
      // Loop through all multiverseIds, which have their own set code and rarity.
      var setImages = source.multiverseids.map(function(multis, i) {
        let rarity = multis.rarity.charAt(0) == "B" ? "C" : multis.rarity.charAt(0); // Replace 'basic' rarity with common.
        let url = "http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=" + multis.multiverseid;
        return (<div>
                <TagFilterConfig field="multiverseids.setName.raw" id="setNameIconTag" title="Set icon" operator={scope.state.setcodesOperator} searchkit={scope.searchkit}/>
                <TagFilter field="multiverseids.setName.raw" value={multis.setName}>
                <img className='setIcon' src={'./src/img/sets/' + multis.setName.replace(/\s+/g,'').replace(":","").replace('"','').replace('"','').toLowerCase() + '-' + rarity + '.jpg'}
                  title={multis.setName}
                  style={{padding: '2px'}}
                  />
                </TagFilter>
                </div>
                 )
      }.bind(this))
      return setImages;
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
    return (
      <div style={{width: '100%', boxSizing: 'border-box', padding: 8}}>
        <table className="sk-table sk-table-striped" style={{width: '100%', boxSizing: 'border-box'}}>
          <thead>
            <tr>
              <th></th> <th>Name</th> <th>Mana cost</th> <th>Type</th> <th>Paper price</th> <th>Sets</th>
            </tr>
          </thead>
          <tbody>
          {map(hits, hit=> (
            <tr key={hit._id}>
              <td style={{margin: 0, padding: 0, width: 40}}>
                <img data-qa="poster" src={
    'https://image.deckbrew.com/mtg/multiverseid/' + hit._source.multiverseids[hit._source.multiverseids.length - 1].multiverseid + '.jpg'} style={{width: 40}}/>
              </td>
              <td>{hit._source.name}</td>
              <td>{generateTitleCostSymbols(hit._source.manaCost)}</td>
              <td>
                <div style={{display:"inline-flex"}} className={"subtitle typeLine"} >
                  <TagFilterConfig field="supertypes.raw" id="supertypeField" title="Supertype" operator={this.state.supertypeOperator} searchkit={this.searchkit}/>
                  {_.map(hit._source.supertypes,supertype =>
                    <div key={supertype} style={{display:"inline-flex"}}>
                      <TagFilter field="supertypes.raw" value={supertype} /><span>&nbsp;</span>
                    </div>)}
                  <TagFilterConfig field="types.raw" id="typeField" title="Type" operator={this.state.typeOperator} searchkit={this.searchkit}/>
                  {_.map(hit._source.types,type =>
                    <div key={type} style={{display:"inline-flex"}}>
                      <TagFilter field="types.raw" value={type} /><span>&nbsp;</span>
                    </div>)}
                  {hit._source.subtypes ? <span>—&nbsp;</span> : <span/>}
                  <TagFilterConfig field="subtypes.raw" id="subtypeField" title="Subtype" operator={this.state.subtypeOperator} searchkit={this.searchkit}/>
                  {_.map(hit._source.subtypes,subtype =>
                    <div key={subtype} style={{display:"inline-flex"}}>
                      <TagFilter field="subtypes.raw" value={subtype} /><span>&nbsp;</span>
                    </div>)}
                </div>
              </td>
              <td>{hit._source.multiverseids[0].medPrice ?
                  "$" + parseFloat(hit._source.multiverseids[0].medPrice).toFixed(2) : (hit._source.multiverseids[1] ? "$" + parseFloat(hit._source.multiverseids[1].medPrice).toFixed(2) : "")
                  }</td>
              <td style={{maxWidth:'160px'}}>
                <div style={{textAlign:'center', maxHeight: '200px', overflow: 'auto', maxWidth:'130px', display:"inline-flex"}}>{getSetIcons(hit._source,this)}</div>
              </td>
            </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  suppressClick(evt) {
    evt.stopPropagation();
  }

  //<InputFilter id="artistName" searchThrottleTime={500} title="Artist name" placeholder="Search artist name" searchOnChange={true} queryOptions={{"minimum_should_match": this.state.matchPercent}} queryFields={["artists"]} />
  //<span className="filterHint"><i>Use ~ for CARDNAME</i></span>
  //,
                      //,
                      //{key:"table", title:"Table", listComponent:this.CardHitsTable}

              /*<select value={this.state.operator} onChange={this.handleOperatorChange.bind(this) }>
                <option value="AND">AND</option>
                <option value="OR">OR</option>
              </select>*/

              /*rightComponent={(
                              <select value={this.state.operator} onChange={this.handleOperatorChange.bind(this)} onClick={(evt) => this.suppressClick(evt)}>
                                <option value="AND">AND</option>
                                <option value="OR">OR</option>
                              </select>
                            )}*/

              /*<OnlyRefinementListFilter id="colourIdentity" title="Colour Identity" field="colorIdentity" size={6} operator={this.state.operator} only={this.state.only}
                            itemComponent={SymbolRefineList} containerComponent={<TogglePanel rightComponent={(<span>
                              <input type="checkbox" className="onlyCheckbox" label="Only" value={this.state.only} onChange={this.handleOnlyChange.bind(this)} onClick={(evt) => this.suppressClick(evt)}/>
                              <select value={this.state.operator} onChange={this.handleOperatorChange.bind(this)} onClick={(evt) => this.suppressClick(evt)} >
                                <option value="AND">AND</option>
                                <option value="OR">OR</option>
                              </select></span>
                            )} collapsable={true} defaultCollapsed={true}/>}/>

 <DynamicRangeFilter rangeFormatter={(count) => count.toFixed(2)} field="multiverseids.mtgoPrice" id="mtgoPrice" title="MTGO Price"/>
              */

  render() {
    return (
      <div>

      <SearchkitProvider searchkit={this.searchkit}>
      <div>
        <div className="sk-layout sk-layout__size-l">

          <div className="sk-layout__top-bar sk-top-bar">
            <div className="sk-top-bar__content">
              <div className="my-logo"><a style={{color:'white', textDecoration:'none'}} href="http://mtg-hunter.com"><span>MtG:Hunter</span></a><br/>
              <a href="http://searchkit.co/" style={{textDecoration:"none"}}>
              <span className="my-logo-small">Made with Searchkit</span></a></div>
              <div className="my-logo"><button style={{backgroundColor: 'transparent', border: '0px', font: "inherit", color: "#eee", cursor:"pointer"}}
                onClick={this.open.bind(this)}>About</button><br/></div>
              <Modal
                aria-labelledby='modal-label'
                style={modalStyle}
                backdropStyle={backdropStyle}
                show={this.state.showModal}
                onHide={this.close.bind(this)}
              >
                <div style={dialogStyle()} >
                  <p>MtG:Hunter is made with <a href="https://facebook.github.io/react/tips/introduction.html"style={{textDecoration:"none"}}>ReactJS</a>,
                    <a href="http://searchkit.co/" style={{textDecoration:"none"}}> Searchkit</a> and a veritable smorgasbord of webpack doing unholy things with CSS files.</p>
                  <p>To report a bug or request a feature, send a message to <a href="mailto:admin@mtg-hunter.com" style={{textDecoration:"none"}}>admin@mtg-hunter.com</a></p>
                  <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
                    <input type="hidden" name="cmd" value="_s-xclick"/>
                    <input type="hidden" name="hosted_button_id" value="QGRS3ZY2ZBAFW"/>
                    <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!"/>
                    <img alt="" border="0" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1"/>
                  </form>
                </div>
              </Modal>
              <SearchBox
                translations={{"searchbox.placeholder": "Search card names. Use regex e.g. \"fire|water|ice\""}}
                queryOptions={{"minimum_should_match": this.state.matchPercent}}
                prefixQueryFields={["name"]}
                autofocus={true}
                searchOnChange={true}
                searchThrottleTime={1000}
                queryFields={["name"]}
                queryBuilder={QueryString}
              />
            </div>
          </div>

          <div className="sk-layout__body">

            <div className="sk-layout__filters">
              <RangeFilter id="cmc" min={0} max={16} title="Converted Cost" field="cmc" showHistogram={true}
              containerComponent={<TogglePanel collapsable={true} defaultCollapsed={true}/>}/>
              <RangeFilter id="paperPrice" min={0} max={10000} rangeComponent={RangeSliderInput} title="Paper Price" field="multiverseids.medPrice" showHistogram={true}
              containerComponent={<TogglePanel collapsable={true} defaultCollapsed={true}/>}/>
              <RangeFilter id="mtgoPrice" min={0} max={160} rangeComponent={RangeSliderInput} title="MTGO Price" field="multiverseids.mtgoPrice" showHistogram={true}
              containerComponent={<TogglePanel collapsable={true} defaultCollapsed={true}/>}/>
              <InputFilter
                queryBuilder={QueryRulesString} id="rulesText" searchThrottleTime={1000} title="Rules text" placeholder="Use ~ for cardname" searchOnChange={true} queryOptions={{"minimum_should_match": this.state.matchPercent}} queryFields={["reminderlessText"]} prefixQueryFields={["reminderlessText"]}
                containerComponent={<TogglePanel collapsable={true} defaultCollapsed={true}/>}/>
              <InputFilter
                queryBuilder={QueryFlavourString} id="flavourText" searchThrottleTime={1000} title="Flavour text" placeholder="Regex supported" searchOnChange={true} queryOptions={{"minimum_should_match": this.state.matchPercent}} queryFields={["multiverseids.flavor"]} prefixQueryFields={["multiverseids.flavor"]}
                containerComponent={<TogglePanel collapsable={true} defaultCollapsed={true}/>}/>
              <InputFilter
                queryBuilder={QueryTypeString} id="typeLine" searchThrottleTime={1000} title="Type text" placeholder="Regex supported" searchOnChange={true} queryOptions={{"minimum_should_match": this.state.matchPercent}} queryFields={["type"]} prefixQueryFields={["type"]}
                containerComponent={<TogglePanel collapsable={true} defaultCollapsed={true}/>}/>

              <OnlyRefinementListFilter id="colours" title="Colours" field="colors.raw" size={6} operator={this.state.coloursOperator} only={this.state.coloursOnly}
                            itemComponent={SymbolRefineList} containerComponent={<TogglePanel rightComponent={(<div style={{display:"flex", maxHeight: 23}} onClick={(evt) => this.suppressClick(evt)}>
                                <input onClick={(evt) => this.suppressClick(evt)} type="checkbox" id="onlyColourBox" className="onlyCheckbox" value={this.state.coloursOnly} onChange={this.handleColourOnlyChange.bind(this)} />
                                <label onClick={(evt) => this.suppressClick(evt)} htmlFor="onlyColourBox">Only</label>
                                <Toggle className={"darkToggle"} items={[{key:"AND",title:"And"},{key:"OR",title:"Or"}]} selectedItems={this.state.coloursOperator} toggleItem={this.handleToggleOperatorChange.bind(this, "coloursOperator")}/>
                              </div>
                            )} collapsable={true} defaultCollapsed={true}/>}/>
              <OnlyRefinementListFilter id="colourIdentity" title="Colour Identity" field="colorIdentity" size={6} operator={this.state.colourIdentityOperator} only={this.state.colourIdentityOnly}
                            itemComponent={SymbolRefineList} containerComponent={<TogglePanel rightComponent={(<div style={{display:"flex", maxHeight: 23}} onClick={(evt) => this.suppressClick(evt)}>
                                <input onClick={(evt) => this.suppressClick(evt)} type="checkbox" id="onlyIdentityBox" className="onlyCheckbox" value={this.state.colourIdentityOnly} onChange={this.handleIdentityOnlyChange.bind(this)} />
                                <label onClick={(evt) => this.suppressClick(evt)} htmlFor="onlyIdentityBox">Only</label>
                                <Toggle className={"darkToggle"} items={[{key:"AND",title:"And"},{key:"OR",title:"Or"}]} selectedItems={this.state.colourIdentityOperator} toggleItem={this.handleToggleOperatorChange.bind(this, "colourIdentityOperator")}/>
                              </div>
                            )} collapsable={true} defaultCollapsed={true}/>}/>

              <RefinementListFilter id="power" title="Power" field="power.raw" size={5} operator={this.state.powerOperator}
                            containerComponent={<TogglePanel rightComponent={(<div style={{display:"flex", maxHeight: 23}} onClick={(evt) => this.suppressClick(evt)}>
                              <Toggle className={"darkToggle"} items={[{key:"AND",title:"And"},{key:"OR",title:"Or"}]} selectedItems={this.state.powerOperator} toggleItem={this.handleToggleOperatorChange.bind(this, "powerOperator")}/>
                              </div>
                            )} collapsable={true} defaultCollapsed={true}/>}/>
              <RefinementListFilter id="toughness" title="Toughness" field="toughness.raw" size={5} operator={this.state.toughnessOperator}
                            containerComponent={<TogglePanel rightComponent={(<div style={{display:"flex", maxHeight: 23}} onClick={(evt) => this.suppressClick(evt)}>
                              <Toggle className={"darkToggle"} items={[{key:"AND",title:"And"},{key:"OR",title:"Or"}]} selectedItems={this.state.toughnessOperator} toggleItem={this.handleToggleOperatorChange.bind(this, "toughnessOperator")}/>
                              </div>
                            )} collapsable={true} defaultCollapsed={true}/>}/>
                            
              <RefinementListFilter id="rarity" title="Rarity" field="multiverseids.rarity.raw" size={5} operator={this.state.rarityOperator}
                            containerComponent={<TogglePanel rightComponent={(<div style={{display:"flex", maxHeight: 23}} onClick={(evt) => this.suppressClick(evt)}>
                              <Toggle className={"darkToggle"} items={[{key:"AND",title:"And"},{key:"OR",title:"Or"}]} selectedItems={this.state.rarityOperator} toggleItem={this.handleToggleOperatorChange.bind(this, "rarityOperator")}/>
                              </div>
                            )} collapsable={true} defaultCollapsed={true}/>}/>

              <RefinementListFilter id="setcodes" title="Set" field="multiverseids.setName.raw" showMore={false} listComponent={SetMultiSelect} size={0} orderKey="_term" operator={this.state.setcodesOperator}
                            containerComponent={<TogglePanel rightComponent={(<div style={{display:"flex", maxHeight: 23}} onClick={(evt) => this.suppressClick(evt)}>
                              <Toggle className={"darkToggle"} items={[{key:"AND",title:"And"},{key:"OR",title:"Or"}]} selectedItems={this.state.setcodesOperator} toggleItem={this.handleToggleOperatorChange.bind(this, "setcodesOperator")}/>
                              </div>
                            )} collapsable={true} defaultCollapsed={true}/>}/>
              <RefinementListFilter id="formats" title="Formats" field="formats.raw" showMore={false} listComponent={MultiSelect} size={0} orderKey="_term" operator={this.state.formatsOperator}
                            containerComponent={<TogglePanel rightComponent={(<div style={{display:"flex", maxHeight: 23}} onClick={(evt) => this.suppressClick(evt)}>
                              <Toggle className={"darkToggle"} items={[{key:"AND",title:"And"},{key:"OR",title:"Or"}]} selectedItems={this.state.formatsOperator} toggleItem={this.handleToggleOperatorChange.bind(this, "formatsOperator")}/>
                              </div>
                            )} collapsable={true} defaultCollapsed={true}/>}/>
              <RefinementListFilter id="cycles" title="Cycles" field="cycle.raw" showMore={false} listComponent={CycleMultiSelect} size={0} orderKey="_term" operator={this.state.cyclesOperator}
                            containerComponent={<TogglePanel rightComponent={(<div style={{display:"flex", maxHeight: 23}} onClick={(evt) => this.suppressClick(evt)}>
                              <Toggle className={"darkToggle"} items={[{key:"AND",title:"And"},{key:"OR",title:"Or"}]} selectedItems={this.state.cyclesOperator} toggleItem={this.handleToggleOperatorChange.bind(this, "cyclesOperator")}/>
                              </div>
                            )} collapsable={true} defaultCollapsed={true}/>}/>

              <RefinementListFilter id="supertype" title="Supertype" field="supertypes.raw" size={5} operator={this.state.supertypeOperator}
                            containerComponent={<TogglePanel rightComponent={(<div style={{display:"flex", maxHeight: 23}} onClick={(evt) => this.suppressClick(evt)}>
                              <Toggle className={"darkToggle"} items={[{key:"AND",title:"And"},{key:"OR",title:"Or"}]} selectedItems={this.state.supertypeOperator} toggleItem={this.handleToggleOperatorChange.bind(this, "supertypeOperator")}/>
                              </div>
                            )} collapsable={true} defaultCollapsed={true}/>}/>
              <RefinementListFilter id="type" title="Type" field="types.raw" size={5} operator={this.state.typeOperator}
                            containerComponent={<TogglePanel rightComponent={(<div style={{display:"flex", maxHeight: 23}} onClick={(evt) => this.suppressClick(evt)}>
                              <Toggle className={"darkToggle"} items={[{key:"AND",title:"And"},{key:"OR",title:"Or"}]} selectedItems={this.state.typeOperator} toggleItem={this.handleToggleOperatorChange.bind(this, "typeOperator")}/>
                              </div>
                            )} collapsable={true} defaultCollapsed={true}/>}/>
              <RefinementListFilter id="subtype" title="Subtype" field="subtypes.raw" showMore={false} listComponent={MultiSelect} size={0} orderKey="_term" operator={this.state.subtypeOperator}
                            containerComponent={<TogglePanel rightComponent={(<div style={{display:"flex", maxHeight: 23}} onClick={(evt) => this.suppressClick(evt)}>
                              <Toggle className={"darkToggle"} items={[{key:"AND",title:"And"},{key:"OR",title:"Or"}]} selectedItems={this.state.subtypeOperator} toggleItem={this.handleToggleOperatorChange.bind(this, "subtypeOperator")}/>
                              </div>
                            )} collapsable={true} defaultCollapsed={true}/>}/>

              <RefinementListFilter id="symbols" title="Symbols" field="symbols" size={6} operator={this.state.symbolsOperator} itemComponent={SymbolRefineList}
                            containerComponent={<TogglePanel rightComponent={(<div style={{display:"flex", maxHeight: 23}} onClick={(evt) => this.suppressClick(evt)}>
                              <Toggle className={"darkToggle"} items={[{key:"AND",title:"And"},{key:"OR",title:"Or"}]} selectedItems={this.state.symbolsOperator} toggleItem={this.handleToggleOperatorChange.bind(this, "symbolsOperator")}/>
                              </div>
                            )} collapsable={true} defaultCollapsed={true}/>}/>
              <RefinementListFilter id="manaCost" title="Mana Cost" field="prettyCost.raw" showMore={false} listComponent={CostMultiSelect} size={0} operator={this.state.manaCostOperator}
                            containerComponent={<TogglePanel rightComponent={(<div style={{display:"flex", maxHeight: 23}} onClick={(evt) => this.suppressClick(evt)}>
                              <Toggle className={"darkToggle"} items={[{key:"AND",title:"And"},{key:"OR",title:"Or"}]} selectedItems={this.state.manaCostOperator} toggleItem={this.handleToggleOperatorChange.bind(this, "manaCostOperator")}/>
                              </div>
                            )} collapsable={true} defaultCollapsed={true}/>}/>

              <RefinementListFilter id="colorCount" title="Colour Count" field="colourCount" size={6} operator={this.state.colourCountOperator} orderKey="_term"
                            containerComponent={<TogglePanel rightComponent={(<div style={{display:"flex", maxHeight: 23}} onClick={(evt) => this.suppressClick(evt)}>
                              <Toggle className={"darkToggle"} items={[{key:"AND",title:"And"},{key:"OR",title:"Or"}]} selectedItems={this.state.colourCountOperator} toggleItem={this.handleToggleOperatorChange.bind(this, "colourCountOperator")}/>
                              </div>
                            )} collapsable={true} defaultCollapsed={true}/>}/>
              <RefinementListFilter id="artists" title="Artist name" field="multiverseids.artist.raw" showMore={false} listComponent={MultiSelect} size={0} orderKey="_term" operator={this.state.artistsOperator}
                            containerComponent={<TogglePanel rightComponent={(<div style={{display:"flex", maxHeight: 23}} onClick={(evt) => this.suppressClick(evt)}>
                              <Toggle className={"darkToggle"} items={[{key:"AND",title:"And"},{key:"OR",title:"Or"}]} selectedItems={this.state.artistsOperator} toggleItem={this.handleToggleOperatorChange.bind(this, "artistsOperator")}/>
                              </div>
                            )} collapsable={true} defaultCollapsed={true}/>}/>
            </div>

            <div className="sk-layout__result sk-results-list">
              <div className="sk-results-list__action-bar sk-action-bar">
                <div className="sk-action-bar-row">
                  <HitsStats />
                  <ViewSwitcherToggle/>
                  <SortingSelector options={[
                    {label:"Name (ascending)", field: "name.raw", order: "asc"},
                    {label:"Name (descending)", field: "name.raw", order: "desc"},
                    {label:"Relevance (ascending)", field:"_score", order:"asc"},
                    {label:"Relevance (descending)", field:"_score", order:"desc"},
                    {label:"Colour (ascending)", field:"colors", order:"asc"},
                    {label:"Colour (descending)", field:"colors", order:"desc"},
                    {label:"CMC (ascending)", field:"cmc", order:"asc"},
                    {label:"CMC (descending)", field:"cmc", order:"desc"},
                    {label:"Card number (ascending)", field:"multiverseids.number", order:"asc"},
                    {label:"Card number (descending)", field:"multiverseids.number", order:"desc"},
                    {label:"Paper Price (ascending)", field:"multiverseids.medPrice", order:"asc"},
                    {label:"Paper Price (descending)", field:"multiverseids.medPrice", order:"desc"},
                    {label:"MTGO Price (ascending)",  field:"multiverseids.mtgoPrice", order:"asc"},
                    {label:"MTGO Price (descending)",  field:"multiverseids.mtgoPrice", order:"desc", defaultOption:true}
                  ]} />
                  <PageSizeSelector options={[4,12,24]} listComponent={Toggle}/>
                </div>

                <div className="sk-action-bar__filters">
                  <GroupedSelectedFilters groupComponent={FilterGroupImg} />
                  <ResetFilters/>
                </div>

              </div>
                <NewViewSwitcher
                    hitsPerPage={12}
                    hitComponents = {[
                      {key:"grid", title:"Grid", itemComponent:this.CardHitsGridItem},
                      {key:"list", title:"List", itemComponent:<CardHitsListItem updateCardName={this.handleClick} currentCard={this.state.clickedCard}/>, defaultOption:true},
                      {key:"table", title:"Table", listComponent:this.CardHitsTable}
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
      <p style={{color: '#999', padding: 10,
        textAlign: 'center',
        position: 'absolute',
        maxWidth: 630,
        right: 60}}>Wizards of the Coast, Magic: The Gathering, and their logos are trademarks of Wizards of the Coast LLC. © 1995-2016 Wizards. All rights reserved. MtG:Hunter is not affiliated with Wizards of the Coast LLC.</p>

      </div>
    )}
}

ReactDOM.render(<App />, document.getElementById('app'));
