import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import "searchkit/theming/theme.scss";
import "./styles/customisations.scss";

import {
  SearchBox,
  Hits,
  HitsStats,
  RefinementListFilter,
  Pagination,
  ResetFilters,
  MenuFilter,
  SelectedFilters,
  HierarchicalMenuFilter,
  NumericRefinementListFilter,
  SortingSelector,
  SearchkitComponent,
  SearchkitProvider,
  SearchkitManager,
  NoHits,
  RangeFilter,
  InitialLoader
} from "searchkit";

const CardHitsItem = (props)=> {
  const {bemBlocks, result} = props;
  let url = "http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=" + result._source.multiverseids[multiverseids.length - 1].multiverseid;
  let imgUrl = 'https://image.deckbrew.com/mtg/multiverseid/' + result._source.multiverseids[multiverseids.length - 1].multiverseid + 'jpg';
  return (
    <div className={bemBlocks.item().mix(bemBlocks.container("item"))} data-qa="hit">
      <a href={url} target="_blank">
        <img data-qa="name" className={bemBlocks.item("name")} src={imgUrl} width="170" height="240"/>
      </a>
      <a href={url} target="_blank">
        <div data-qa="name" className={bemBlocks.item("name")} dangerouslySetInnerHTML={{__html:_.get(result,"highlight.name",false) || result._source.name}}>
        </div>
      </a>
    </div>
  )
}

export class App extends React.Component<any, any> {

  constructor() {
    super()
    const host = "http://localhost:9200/cards/card"
    this.searchkit = new SearchkitManager(host)   
  }

  render(){

    return (
      <div>
      <SearchkitProvider searchkit={this.searchkit}>
      <div>
        <div className="layout">

          <div className="layout__top-bar top-bar">
            <div className="top-bar__content">
              <div className="my-logo">Gatherer cards</div>
              <SearchBox
                translations={{"searchbox.placeholder":"search cards"}}
                queryOptions={{"minimum_should_match":"70%"}}
                autofocus={true}
                searchOnChange={true}
                queryFields={["artist","name","text"]}/>
            </div>
          </div>

          <div className="layout__body">

              <div className="layout__filters">                              
                <RefinementListFilter id="colors" title="Colors" field="colors.raw" size={5}/>
                <RefinementListFilter id="layout" title="Layout" field="layout.raw" size={5}/>
                <RefinementListFilter id="type" title="Type" field="type.raw" size={5}/>
                <RefinementListFilter id="codes" title="Codes" field="codes.raw" size={5}/>
            </div>

                <div className="layout__results results-list">

              <div className="results-list__action-bar action-bar">

                <div className="action-bar__info">
                    <HitsStats />
                      
                    </div>

                <div className="action-bar__filters">
                  <SelectedFilters/>
                  <ResetFilters/>
                </div>

              </div>
                    <Hits hitsPerPage={12} highlightFields={["name"]}
                    itemComponent={CardHitsItem}
                    scrollTo="body"
              />
              <NoHits suggestionsField={"name"}/>
              <InitialLoader/>
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
