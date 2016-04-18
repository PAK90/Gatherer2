import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import "searchkit/theming/theme.scss";
import "./styles/customisations.scss";
import {TagFilter, TagFilterConfig, TagFilterList} from 'searchkit';
var ent = require('ent');
const nl2br = require('react-nl2br');
var ReactTabs = require('react-tabs');
var Tab = ReactTabs.Tab;
var Tabs = ReactTabs.Tabs;
var TabList = ReactTabs.TabList;
var TabPanel = ReactTabs.TabPanel;
var ReactDisqusThread = require('react-disqus-thread');
//var cards = require('./multiIdName.json');
//var modCards = cards;
// Turn cards object keys into the format returned by the python script.
// Just go in and create a new key, and replace each object's key with the new key.
/*for (var key in modCards) {
    var keyLower = key.toLowerCase();
    var keyLowerDash = keyLower.replace("-", "~").replace("æ","ae").replace('û','u').replace('!','').replace('ú','u').replace('â','a').replace('ö','o').replace("-", "~").replace("-", "~").replace("-", "~").replace("á","a").replace("é","e");
    if (keyLowerDash !== key) {
        var temp = modCards[key];
        delete modCards[key];
        modCards[keyLowerDash] = temp;
    }
}*/

var CardHitsListItem = React.createClass({
	getInitialState: function() {  	
	    var {bemBlocks, result} = this.props;
	    var source = result._source;
	    // At some point, have all multiverse-specific stuff (id, flavour text, original text) as states.
	    // Then, when you click the symbol, all we have to do is load that multi's data into the states which are already in the renderer.
        return {
            clickedCard: '',
            currentMultiId: source.multiverseids[result._source.multiverseids.length - 1].multiverseid,
            currentImageMultiId: source.multiverseids[result._source.multiverseids.length - 1].multiverseid,
            currentArtist: source.multiverseids[result._source.multiverseids.length - 1].artist,
            currentFlavor: source.multiverseids[result._source.multiverseids.length - 1].flavor,
            currentOriginalText: source.multiverseids[result._source.multiverseids.length - 1].originalText,
            currentSetName: source.multiverseids[result._source.multiverseids.length - 1].setName,
            currentNumber: source.multiverseids[result._source.multiverseids.length - 1].number,
            currentLowPrice: source.multiverseids[result._source.multiverseids.length - 1].lowPrice,
            currentMedPrice: source.multiverseids[result._source.multiverseids.length - 1].medPrice,
            currentHiPrice: source.multiverseids[result._source.multiverseids.length - 1].hiPrice,
            currentFoilPrice: source.multiverseids[result._source.multiverseids.length - 1].foilPrice,
            currentStoreLink: source.multiverseids[result._source.multiverseids.length - 1].storeLink,
            currentSelectedTab: 0,
            currentImageLayout: '',
        };
    },

    handleClick(source) {
	    // If clicked on a different card, change the name.
	    if (this.state.clickedCard != source.name)
	    {
	      this.setState({clickedCard: source.name});
	    }
	    // Else, we clicked on the same card, so shrink.
	    // The enlarging/shrinking happens via a css style which turns on/off based on whether clickedCard matches current card name.
	    else {
	      this.setState({clickedCard: ''});
	    }
	},
	
	handleTabSelect(index, last) {
		this.setState({currentSelectedTab: index});
	},

	handleSetIconClick(multi) {
		// Set the new multiId. Eventually this will work for flavour and original text too.
		this.setState({currentMultiId: multi.multiverseid,
			currentImageMultiId: multi.multiverseid,
			currentArtist: multi.artist,
			currentFlavor: multi.flavor,
			currentOriginalText: multi.originalText,
			currentSetName: multi.setName,
			currentNumber: multi.number,
			currentLowPrice: multi.lowPrice,
            currentMedPrice: multi.medPrice,
            currentHiPrice: multi.hiPrice,
            currentFoilPrice: multi.foilPrice,
            currentStoreLink: multi.storeLink});
	},

	onCardNameHover(card) {
		console.log("hovered card is " + card);
		//this.setState({currentImageMultiId: language.multiverseid});
	},

	onLanguageHover(language) {
		this.setState({currentImageMultiId: language.multiverseid});
	},

	onLanguageHoverOut(language) {
		this.setState({currentImageMultiId: this.state.currentMultiId});
	},

	onLayoutHover(source) {
		this.setState({currentImageLayout: source.layout});
		if (source.layout == 'double-faced') {
			//var targetName = source.name == source.names[0] ? source.names[1] : source.names[0];
			this.setState({currentImageMultiId: source.flipSideMultiId});
		}
	},

	onLayoutHoverOut() {
		this.setState({currentImageLayout: '', currentImageMultiId: this.state.currentMultiId});
	},

    getSetIcons: function(source) {
    	// Loop through all multiverseIds, which have their own set code and rarity.
    	var setImages = source.multiverseids.map(function(multis, i) {
      		let rarity = multis.rarity.charAt(0) == "B" ? "C" : multis.rarity.charAt(0); // Replace 'basic' rarity with common.
      		let url = "http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=" + multis.multiverseid;
      		return (
            	<img className={(this.state.currentMultiId == multis.multiverseid ? "clicked " : "") + "setIcon " + rarity } src={'./src/img/sets/' + multis.setName.replace(/\s+/g,'').replace(":","").replace('"','').replace('"','').toLowerCase() + '-' + rarity + '.jpg'} 
	                title={multis.setName}
	                onClick={this.handleSetIconClick.bind(this, multis)}/>
	            )
	    	}.bind(this))
    	return setImages;
  	},

  	generateTitleCostSymbols: function(source) {
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
	},

	generateTextCostSymbols: function(source) {
		var tagged;
		if (source !== undefined) {
		    // Get rid of / in any costs first, but only if inside {} brackets (so as not to affect +1/+1).
		    //source = this.generateCardHoverSpan(source);
		    source = source.replace(/(\/)(?=\w\})/g,'');
		    // Then generate the tags through setting the innerHtml. This is the only way to preserve the text around the img tags.
		    // Encode the source in html, to prevent XSS nastiness. Then replace the newlines with <br/>. Then insert the <img> tags.
		    tagged = <div dangerouslySetInnerHTML={{__html: ent.encode(source).replace(/&#10;/g, '<br/>').replace(/\{([0-z,½,∞]+)\}/g, (fullMatch, firstMatch) =>
		        `<img src=./src/img/${firstMatch.toLowerCase()}.png height=12px/>`
		    )}}></div>
		}
		return tagged;
	},

	generateCardHoverSpan: function(source) {
		var tagged;
		if (source !== undefined) {
		    // Then generate the tags through setting the innerHtml. This is the only way to preserve the text around the img tags.
		    // Encode the source in html, to prevent XSS nastiness. Then replace the newlines with <br/>. Then insert the <img> tags.
		    tagged = <div dangerouslySetInnerHTML={{__html: ent.encode(source).replace(/&#10;/g, '<br/>').replace(/\[(.*?)\]/g, (fullMatch, firstMatch) =>
		        `<span onMouseOver={this.onCardNameHover(${firstMatch})}><b>${firstMatch}</b></span>`
		    )}}></div>
		}
		return tagged;
	},

	render: function() {
	    var {bemBlocks, result} = this.props;
	    var source = result._source;
	    let url = "http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=" + this.state.currentMultiId;
	    let imgUrl = 'https://image.deckbrew.com/mtg/multiverseid/' + this.state.currentImageMultiId + '.jpg';
	    // Generate the mana symbols in both cost and the card text.	    
	    source.tagCost = this.generateTitleCostSymbols(source.manaCost);
	    source.taggedText = this.generateTextCostSymbols(source.text);

	    // Define 'details' tab information here.
	    var extraInfo, flavour, pt, legalities, otherSide, price;
	    if (this.state.currentMedPrice || this.state.currentFoilPrice) {
	    	price = ( <div style={{fontSize: "x-small"}}>
    			<a href={this.state.currentStoreLink} target="_blank">
    				<span className={bemBlocks.item("subtitle")} style={{fontSize: "inherit"}}><b>{this.state.currentMedPrice == "0" ? '' : 'Paper: '}</b></span>
    				<span className={bemBlocks.item("subtitle")}>{this.state.currentMedPrice == "0" ? '' : '$'+this.state.currentMedPrice}</span>
    				<span className={bemBlocks.item("subtitle")}><b>{(this.state.currentFoilPrice != "0" && this.state.currentMedPrice != "0") ? '  ' : ''}</b></span>
    				<span className={bemBlocks.item("subtitle")} style={{fontSize: "inherit"}}><b>{this.state.currentFoilPrice == "0" ? '' : 'Foil: '}</b></span>
    				<span className={bemBlocks.item("subtitle")}>{this.state.currentFoilPrice == "0" ? '' : '$'+this.state.currentFoilPrice}</span>
    			</a>
    		</div> )
	    }
	    else { price = <div/>}
    	if (source.power) {
    		pt = ( <div className={bemBlocks.item("subtitle") + " tagFiltered"} style={{display:"inline-flex"}}>		
		        <span style={{color: "#ddd"}}><b>{'P/T:'}</b></span>
		        <span>&nbsp;</span>
		        <TagFilterConfig field="power.raw" id="powerField" title="Power" operator="AND" searchkit={this.searchkit} />
		        <TagFilter field="power.raw" value={source.power} />
		        <span>/</span>
		        <TagFilterConfig field="toughness.raw" id="toughnessField" title="Toughness" operator="AND" searchkit={this.searchkit} />
		        <TagFilter field="toughness.raw" value={source.toughness} />
		        <br/>
	        </div> )
    	}
    	else { pt = <div/>}
    	if (this.state.currentFlavor) {
    		flavour = ( <div>		
		        <span className={bemBlocks.item("subtitle")}><b>{'Flavour: '}</b></span><span className={bemBlocks.item("subtitle")}>{nl2br(this.state.currentFlavor)}</span>
		        <br/>
	        </div> )
    	}
    	else { flavour = <div/> }
    	extraInfo = (
    		<div>	
		        <span className={bemBlocks.item("subtitle")}><b>{'Set: '}</b></span>
		        <div className={bemBlocks.item("subtitle")} style={{display:"inline-flex"}}>
			        <TagFilterConfig field="multiverseids.setName.raw" id="codeNames" title="Set name" operator="AND" searchkit={this.searchkit} />
			        <TagFilter field="multiverseids.setName.raw" value={this.state.currentSetName} />
		        </div>
		        <span className={bemBlocks.item("subtitle")}>{(this.state.currentNumber ? ' (#' + this.state.currentNumber + ')' : '')}</span>
		        <br/>
		        <span className={bemBlocks.item("subtitle")}><b>{'Artist: '}</b></span>
		        <div className={bemBlocks.item("subtitle")} style={{display:"inline-flex"}}>
			        <TagFilterConfig field="multiverseids.artist.raw" id="artistNames" title="Artist name" operator="AND" searchkit={this.searchkit} />
			        <TagFilter field="multiverseids.artist.raw" value={this.state.currentArtist} />
		        </div>
		        <br/>
	        </div>
    	)
    	if (source.legalities) {
	    	legalities = (<div>
		        <span className={bemBlocks.item("subtitle")}><b>{'Legalities: '}</b></span>
		        { source.legalities.map(function(legality, i) {
		        	return (<div>
				        	<div className={bemBlocks.item("subtitle")} style={{display:"inline-flex"}}>
					        <TagFilterConfig field="formats.raw" id="artistNames" title="Format name" operator="AND" searchkit={this.searchkit} />
					        <TagFilter field="formats.raw" value={legality.format} />
				        </div>
		        		<span className={legality.legality == "Banned" ? bemBlocks.item("subtitle") + ' banned' : bemBlocks.item("subtitle") + ' legal'}>{': '+legality.legality}</span><br/>
		        	</div>)
		        }.bind(this))}
		        </div>
	    	)
	    }
    	else { legalities = <div/> }
    	if (source.layout == "flip" || source.layout == "double-faced" || source.layout == "split") {
    		otherSide = (
    			<span onMouseOver={this.onLayoutHover.bind(this, source)}
    				onMouseOut={this.onLayoutHoverOut}
    				className={bemBlocks.item("subtitle")}><b>{source.name == source.names[0] ? source.names[1] : source.names[0]}</b></span>
    		)
    	}
    	else {
    		otherSide = <div/>
    	}

    	// Define rulings here.
    	var rulings;
    	if (source.rulings) {
    		rulings = (<div>
    			{ source.rulings.map(function(ruling, i) {
    				return <div><span className={bemBlocks.item("subtitle")}><b>{ruling.date + ": "}</b></span>
    							<span className={bemBlocks.item("subtitle")}>{this.generateCardHoverSpan(ruling.text)}</span></div>
    			}.bind(this))}
    			</div>
    		)
    	}
    	else {
    		rulings = <div><span className={bemBlocks.item("subtitle")}>No rulings!</span></div>;
    	}

    	// Define languages here.
    	var whichMultiIndex = source.multiverseids.length - 1;
    	for (var i = 0; i <= whichMultiIndex; i++) {
    		if (_.includes(source.multiverseids[i], this.state.currentMultiId)) {
    			whichMultiIndex = i;
    			break;
    		}
    	}
    	var languages;
    	if (source.multiverseids[whichMultiIndex].foreignNames) {
    		languages = (<div>
    			{ source.multiverseids[whichMultiIndex].foreignNames.map(function(language, i) {
    				return <div><span onMouseOver={this.onLanguageHover.bind(this, language)} className={bemBlocks.item("subtitle")}><b>{language.language + ": "}</b></span>
    							<span onMouseOver={this.onLanguageHover.bind(this, language)} 
    							onMouseOut={this.onLanguageHoverOut.bind(this, language)} 
    							className={bemBlocks.item("subtitle")}>{language.name}</span></div>
    			}.bind(this))}
    			</div>
    		)
    	}
    	else {
    		languages = <div><span className={bemBlocks.item("subtitle")}>No other languages!</span></div>;
    	}

    	// Define comments!

    	// Define prices!

    	// Define 10 closest cards!
    	var closest10;
  		var elemInlineBlock = {
			display: 'inline-block',
			textAlign: 'left',
			padding: '3px'
		};
		var spanStyle = {
			position: 'relative',
			color: '#F8F8F8',
		    backgroundColor: '#000000',
		    borderColor: '#000000',
		    padding: '2px 2px 0px 2px',
		    borderTopRightRadius: '5px',
		    borderTopLeftRadius: '5px',
		    left: '12px'
		};
    	if (source.closestCards) {
    		closest10 = (<div>
    			{source.closestCards.map(function(card, i) {
    				return <div style={elemInlineBlock}>
    					<span style={spanStyle}>{Math.round(card.deviation * 10000)/10000}</span>
    					<img className="closestImg" src={'https://image.deckbrew.com/mtg/multiverseid/'+card.multiId+'.jpg'}/>
	                	</div>
    			})}
    			</div>
    		)
    	}
    	else {
    		closest10 = <div><span className={bemBlocks.item("subtitle")}>No closest cards!</span></div>;
    	}


		        /*<TabPanel>
			        <ReactDisqusThread
		                shortname="mtg-hunter"
		                identifier={this.state.currentSetName + ': ' + source.name}
		                title={this.state.currentSetName + ': ' + source.name}
		                url="http://localhost:3333/"
		                category_id="4523863"/>
		        </TabPanel>
		        <TabPanel>
		          <h2>Hello from expensive card!</h2>
		        </TabPanel>*/

    	// Define the tab stuff here.
    	var selectedInfo;
	    if (this.state.clickedCard) {
        	selectedInfo = (<Tabs selectedIndex={this.state.currentSelectedTab} onSelect={this.handleTabSelect}>
        		<TabList>
	        		<Tab>Details</Tab>
	            	<Tab>Rulings</Tab>
	            	<Tab>Languages</Tab>
	            	<Tab>10 closest cards</Tab>
	        	</TabList>
            	<TabPanel>
					<div className='extraDetails'>{flavour}{extraInfo}{legalities}</div> 
		        </TabPanel>
		        <TabPanel>
		          <div className='extraDetails'>{rulings}</div> 
		        </TabPanel>
		        <TabPanel>
		          <div className='extraDetails'>{languages}</div> 
		        </TabPanel>
		        <TabPanel>
		          {closest10}
		        </TabPanel>
        	</Tabs>)
	    }
	    else {
	    	selectedInfo = <div/>
	    }
	    // In the style for the set icons, 'relative' enables cards like Forest to grow the div around them to fit all the symbols.
	    // In the future, might want an 'open/close' <p> tag for that, since it's pretty useless seeing all those symbols anyway.
	    // The <p> tag helps to align the symbols in the centre, and probably other important css-y stuff.
	    // this.state.clickedCard is '' when unclicked, which is apparently false-y enough to use for a bool.

						        /*<h3 className={bemBlocks.item("subtitle")}><b>{source.type}</b></h3>*/
	    return (
	    	<div className={bemBlocks.item().mix(bemBlocks.container("item"))} style={{display: 'block'}}>
	    		<div style={{display: 'flex'}}>
	    			{/* Block 1; the card image. */}
		    		<div className={"listImgDiv "} style={{display:'inline-block'}}>
		          		<img className={(this.state.clickedCard ? "clicked " : "") + "listImg "+ this.state.currentImageLayout }
		            		src={imgUrl} 
		            		style={{borderRadius: this.state.clickedCard ? "10" : "6", cursor:"hand"}} 
		            		width="100"
		            		onClick={this.handleClick.bind(this, source)} />
		        	</div>
	    			{/* Block 2; the title + text, details tabs, and set icons. Width = 100% to stretch it out and 'align right' the set icons. */}
		        	<div style={{width:'100%'}}>
	    				{/* Block 3; the title + text and set icons. */}
		        		<div style={{display:'flex'}}>
				        	<div className={bemBlocks.item("details")} style={{display:'inline-block'}}>
				         		<h2 className={bemBlocks.item("title")}>{source.name} {source.tagCost} ({source.cmc ? source.cmc : 0}) {otherSide} {price}</h2>
				         		{/* The type line is special since it's made of TagFilters. */}
						        <div style={{display:"inline-flex"}} className={bemBlocks.item("subtitle") + " typeLine"}>
						        	<TagFilterConfig field="supertypes.raw" id="supertypeField" title="Supertype" operator="AND" searchkit={this.searchkit} />
						        	{_.map(source.supertypes,supertype => 
						        		<div style={{display:"inline-flex"}}>
						        			<TagFilter field="supertypes.raw" value={supertype} /><span>&nbsp;</span>
						        		</div>)}
						        	<TagFilterConfig field="types.raw" id="typeField" title="Type" operator="AND" searchkit={this.searchkit} />
						        	{_.map(source.types,type => 
						        		<div style={{display:"inline-flex"}}>
						        			<TagFilter field="types.raw" value={type} /><span>&nbsp;</span>
						        		</div>)}
						        	{source.subtypes ? <span>—&nbsp;</span> : <span/>}
						        	<TagFilterConfig field="subtypes.raw" id="subtypeField" title="Subtype" operator="AND" searchkit={this.searchkit} />
						        	{_.map(source.subtypes,subtype => 
						        		<div style={{display:"inline-flex"}}>
						        			<TagFilter field="subtypes.raw" value={subtype} /><span>&nbsp;</span>
						        		</div>)}
						        </div>
						        <h3 className={bemBlocks.item("subtitle")}>{source.taggedText}{pt}</h3>
						    </div>
				        	<div style={{width: '150px', position: 'relative', right: '10px', display:'inline-block'}}>
				          		<p style={{textAlign:'center'}}>{this.getSetIcons(source)}</p>
				        	</div>	
				        </div>
	    				{/* The tab panel is by itself under block 3. */}
	        			<div className={bemBlocks.item("details")}>{selectedInfo}</div>
		        	</div>			        
	        	</div>
	      	</div>
	    )
	}
});

export default CardHitsListItem;