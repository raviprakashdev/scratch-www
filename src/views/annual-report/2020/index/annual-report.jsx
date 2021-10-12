const bindAll = require('lodash.bindall');
const classNames = require('classnames');
const React = require('react');
const MediaQuery = require('react-responsive').default;
const FormattedMessage = require('react-intl').FormattedMessage;
const injectIntl = require('react-intl').injectIntl;
const intlShape = require('react-intl').intlShape;

const render = require('../../../../lib/render.jsx');
const frameless = require('../../../../lib/frameless');

const Avatar = require('../../../../components/avatar/avatar.jsx');
const Page = require('../../../../components/page/www/page.jsx');
const Grid = require('../../../../components/grid/grid.jsx');
const Button = require('../../../../components/forms/button.jsx');
const FlexRow = require('../../../../components/flex-row/flex-row.jsx');
const Comment = require('../../../../components/comment/comment.jsx');
const CountryBlurb = require('../../../../components/country-blurb/country-blurb.jsx');
const AnnualReportExample = require('../../../../components/annual-report-example/annual-report-example.jsx');
const WorldMap = require('../../../../components/world-map/world-map.jsx');
const CountryUsage = require('./country-usage.json');
const IndiaProjects = require('./india-projects.json');
const PeopleGrid = require('../../../../components/people-grid/people-grid.jsx');
const People = require('./people.json');
const BLMProjects = require('./blm-projects.json');
const VideoPreview = require('../../../../components/video-preview/video-preview.jsx');
const Supporters = require('./supporters.json');
import { TwitterTweetEmbed } from 'react-twitter-embed';


require('./annual-report.scss');

// Founder’s Message / Mission / Reach / Themes / Director’s Message / Supporters / Team / Donate

// Some constants used for the page subnav and section refs
const SECTIONS = {
    founders_message: 'founders-message',
    mission: 'mission',
    reach: 'reach',
    themes: 'themes',
    directors_message: 'directors_message',
    supporters: 'supporters',
    team: 'team',
    donate: 'donate'
};

const SECTION_NAMES = {
    founders_message: <FormattedMessage id="annualReport.subnavFoundersMessage" />,
    mission: <FormattedMessage id="annualReport.subnavMission" />,
    reach: <FormattedMessage id="annualReport.subnavReach" />,
    themes: <FormattedMessage id="annualReport.subnavThemes" />,
    directors_message: <FormattedMessage id="annualReport.subnavDirectors_message" />,
    supporters: <FormattedMessage id="annualReport.subnavSupporters" />,
    team: <FormattedMessage id="annualReport.subnavTeam" />,
    donate: <FormattedMessage id="annualReport.subnavDonate" />
};

// Constants used for world map data processing/formatting for use with Plotly
const countryNames = Object.keys(CountryUsage);
const countryData = countryNames.map(key =>
    `<b>${CountryUsage[key].display}</b><br>${CountryUsage[key].count.toLocaleString('en')}`
);
const colorIndex = countryNames.map(key => CountryUsage[key]['log count']);

// Create the div given a list of supporter names,
// this will contain two columns of names either of equal size
// or with the left column containing 1 more item than the right
const createSupportersLists = supportersList => {
    const splitIndex = Math.ceil(supportersList.length / 2);
    const firstHalf = supportersList.slice(0, splitIndex);
    const secondHalf = supportersList.slice(splitIndex);
    
    return (
        <div className="supporters-list">
            <ul className="supporters-list-side">
                {
                    firstHalf.map((supporter, index) => (<li key={index}>{supporter}</li>))
                }
            </ul>
            <ul className="supporters-list-side">
                {
                    secondHalf.map((supporter, index) => (<li key={index}>{supporter}</li>))
                }
            </ul>
        </div>
    );
};

class AnnualReport extends React.Component {
    constructor (props) {
        super(props);

        // Storage for each of the section refs when we need to refer
        // to them in the scroll handling code
        // These will be stored with a short lowercase key representing
        // the specific section (e.g. 'mission')
        this.sectionRefs = {};

        this.subnavRef = null;

        this.state = {
            currentlyVisible: SECTIONS.founders_message, // The currently visible section
            dropdownVisible: false
        };

        bindAll(this, [
            'scrollTo',
            'setRef',
            'setSubnavRef',
            'handleSubnavItemClick',
            'getDimensionsOfSection',
            'handleScroll',
            'handleDropDownClick'
        ]);
    }

    componentDidMount () {
        window.addEventListener('scroll', this.handleScroll);
    }

    componentWillUnMount () {
        window.removeEventListener('scroll', this.handleScroll);
    }

    // A generic handler for a subnav item that takes the name of the
    // section to scroll to (all lowercase)
    handleSubnavItemClick (sectionName) {
        // Return a button click handler that will close the dropdown if open
        // and scrolls to the correct section
        return () => {
            this.setState({dropdownVisible: false});
            this.scrollTo(this.sectionRefs[sectionName]);
        };
    }

    scrollTo (element) {
        if (element) {
            const sectionTop = this.getDimensionsOfSection(element).offsetTop;
            window.scrollTo({top: sectionTop, behavior: 'smooth'});
            // The smooth scrolling doesn't work on Safari
            // but this code allows scrolling to the correct part of the section
            // in Safari since the css property 'scrollMarginTop' is also not supported there
        }
    }

    // Generically create a ref for the given section, stored in
    // this.sectionRefs
    setRef (sectionName) {
        return ref => (this.sectionRefs[sectionName] = ref);
    }

    setSubnavRef (ref) {
        this.subnavRef = ref;
    }

    // Calculate the dimensions of a given section for use in figuring out
    // which section is currently visible
    getDimensionsOfSection (sectionRef) {
        const {height} = sectionRef.getBoundingClientRect();
        const offsetTop = sectionRef.offsetTop;
        const offsetBottom = offsetTop + height;

        return {
            height,
            offsetTop,
            offsetBottom
        };
    }

    // While scrolling, update the subnav to reflect the currently visible section
    handleScroll () {
        const subnavHeight = this.getDimensionsOfSection(this.subnavRef).height;
        // The additional 50 is to account for the main site nav height
        const currentScrollPosition = window.scrollY + subnavHeight + 50;

        // Find which section is currently visible based on our scroll position
        for (const key in this.sectionRefs) {
            if (!this.sectionRefs.hasOwnProperty(key)) continue;
            const currentRef = this.sectionRefs[key];
            const {offsetBottom, offsetTop} = this.getDimensionsOfSection(currentRef);
            if (currentScrollPosition > offsetTop && currentScrollPosition < offsetBottom) {
                if (this.state.currentlyVisible !== key) {
                    this.setState({currentlyVisible: key});
                    return;
                }
            }
        }
    }

    // Click handler for responsive subnav dropdown
    handleDropDownClick () {
        this.setState({dropdownVisible: !this.state.dropdownVisible});
    }

    render () {
        // Element containing buttons to scroll to each of the sections in the
        // annual report. The layout of this component will be different on
        // different screen sizes (see below)
        const subnav =
            (<FlexRow className="inner">
                <a
                    className={classNames(
                        {selectedItem: this.state.currentlyVisible === SECTIONS.founders_message}
                    )}
                    onClick={this.handleSubnavItemClick(SECTIONS.founders_message)}
                >
                    {SECTION_NAMES.founders_message}
                </a>
                <a
                    className={classNames(
                        {selectedItem: this.state.currentlyVisible === SECTIONS.mission}
                    )}
                    onClick={this.handleSubnavItemClick(SECTIONS.mission)}
                >
                    <FormattedMessage id="annualReport.subnavMission" />
                </a>
                <a
                    className={classNames(
                        {selectedItem: this.state.currentlyVisible === SECTIONS.reach}
                    )}
                    onClick={this.handleSubnavItemClick(SECTIONS.reach)}
                >
                    <FormattedMessage id="annualReport.subnavReach" />
                </a>
                <a
                    className={classNames(
                        {selectedItem: this.state.currentlyVisible === SECTIONS.themes}
                    )}
                    onClick={this.handleSubnavItemClick(SECTIONS.themes)}
                >
                    <FormattedMessage id="annualReport.subnavThemes" />
                </a>
                <a
                    className={classNames(
                        {selectedItem: this.state.currentlyVisible === SECTIONS.directors_message}
                    )}
                    onClick={this.handleSubnavItemClick(SECTIONS.directors_message)}
                >
                    <FormattedMessage id="annualReport.subnavDirectorsMessage" />
                </a>
                <a
                    className={classNames(
                        {selectedItem: this.state.currentlyVisible === SECTIONS.supporters}
                    )}
                    onClick={this.handleSubnavItemClick(SECTIONS.supporters)}
                >
                    <FormattedMessage id="annualReport.subnavSupporters" />
                </a>
                <a
                    className={classNames(
                        {selectedItem: this.state.currentlyVisible === SECTIONS.team}
                    )}
                    onClick={this.handleSubnavItemClick(SECTIONS.team)}
                >
                    <FormattedMessage id="annualReport.subnavTeam" />
                </a>
                <a
                    className={classNames(
                        {selectedItem: this.state.currentlyVisible === SECTIONS.donate}
                    )}
                    onClick={this.handleSubnavItemClick(SECTIONS.donate)}
                >
                    <FormattedMessage id="annualReport.subnavDonate" />
                </a>
            </FlexRow>);

        return (
            <div>
                <div
                    className="subnavigation"
                    ref={this.setSubnavRef}
                >
                    {/* Top Bar */}
                    <MediaQuery maxWidth={frameless.tabletPortrait - 1}>
                        <div className="sectionIndicator inner" >
                            {SECTION_NAMES[this.state.currentlyVisible]}
                            <Button
                                className="dropdown-button"
                                onClick={this.handleDropDownClick}
                            >
                                <img
                                    className={classNames({rotated: this.state.dropdownVisible})}
                                    src="/images/annual-report/dropdown-arrow.svg"
                                />
                            </Button>
                        </div>
                        {this.state.dropdownVisible ?
                            /* Bottom Bar */
                            <div className="inner">
                                <hr />
                                {subnav}
                            </div> :
                            null
                        }
                    </MediaQuery>
                    {/* For large screens, show whole subnav, with no dropdown */}
                    <MediaQuery minWidth={frameless.tabletPortrait}>
                        {subnav}
                    </MediaQuery>
                </div>
                <div className="annual-report-content">
                    <div
                        className="message-section"
                        ref={this.setRef(SECTIONS.founders_message)}
                    >
                        <div className="inner">
                            <FlexRow className="masthead">
                                <div className="masthead-content">
                                    <p className="message-year">
                                        <FormattedMessage id="annualReport.mastheadYear" />
                                    </p>
                                    <h1>
                                        <FormattedMessage id="annualReport.mastheadTitle" />
                                    </h1>
                                </div>
                                <img src="/images/annual-report/2020/founders-message/Masthead_Illustration.svg" />
                            </FlexRow>
                            <MediaQuery minWidth={frameless.desktop}>
                                <img
                                    className="wave-icon-desktop"
                                    src="/images/annual-report/message/wave-icon.svg"
                                />
                            </MediaQuery>
                            <FlexRow className="message-content">
                                <MediaQuery maxWidth={frameless.desktop - 1}>
                                    {/* Show the wave icon inside this div in smaller screens */}
                                    <div className="wave-icon-and-title">
                                        <img src="/images/annual-report/2020/founders-message/Wave_Icon.svg" />
                                        <h2>
                                            <FormattedMessage id="annualReport.foundersMessageTitle" />
                                        </h2>
                                    </div>
                                </MediaQuery>
                                <MediaQuery minWidth={frameless.desktop}>
                                    <h2>
                                        <FormattedMessage id="annualReport.foundersMessageTitle" />
                                    </h2>
                                </MediaQuery>
                                <div className="message-from-team">
                                    <p>
                                        <FormattedMessage id="annualReport.foundersMessageP1" />
                                    </p>
                                    <p>
                                        <FormattedMessage id="annualReport.foundersMessageP2" />
                                    </p>
                                    <p>
                                        <FormattedMessage id="annualReport.foundersMessageP3" />
                                    </p>
                                    <p>
                                        <FormattedMessage id="annualReport.foundersMessageP4" />
                                    </p>
                                    <p>
                                        <FormattedMessage id="annualReport.foundersMessageP5" />
                                    </p>
                                    <div className="founders-signature">
                                        <img
                                            className="mitch-photo"
                                            src="/images/annual-report/2020/founders-message/mitch_headshot.jpg"
                                        />
                                        <div className="signature-container">
                                            <p className="message-signature">
                                                <FormattedMessage id="annualReport.foundersMessageSignature" />
                                            </p>
                                            <p>
                                                <FormattedMessage id="annualReport.foundersMessageScratchTitle" />
                                            </p>
                                            <p>
                                                <FormattedMessage id="annualReport.foundersMessageAffiliation" />
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </FlexRow>
                        </div>
                        <div className="transition-images">
                            <img src="/images/annual-report/message/blocks.svg" />
                            <img src="/images/annual-report/message/banana.svg" />
                        </div>
                    </div>
                    <div
                        className="mission-section"
                        ref={this.setRef(SECTIONS.mission)}
                    >
                        <div className="inner">
                            <h2><FormattedMessage id="annualReport.missionTitle" /></h2>
                            <h5><FormattedMessage id="annualReport.visionHeader" /></h5>
                            <p className="mission-subtitle"><FormattedMessage id="annualReport.visionSubtitle" /></p>
                            <h5><FormattedMessage id="annualReport.missionHeader" /></h5>
                            <p className="mission-subtitle"><FormattedMessage id="annualReport.missionSubtitle" /></p>
                            <p><FormattedMessage id="annualReport.missionP1" /></p>
                            <p><FormattedMessage id="annualReport.missionP2" /></p>
                            <p>
                                <FormattedMessage
                                    id="annualReport.missionP3"
                                    values={{
                                        fourPsItalics: (
                                            <i>
                                                <FormattedMessage id="annualReport.fourPs" />
                                            </i>
                                        )
                                    }}
                                />
                            </p>
                        </div>
                        <div className="four-ps">
                            <MediaQuery minWidth={frameless.tabletPortrait}>
                                <div className="one-p four-ps-projects">
                                    <div className="title-and-description">
                                        <h3><FormattedMessage id="annualReport.missionProjectsTitle" /></h3>
                                        <p><FormattedMessage id="annualReport.missionProjectsDescription" /></p>
                                    </div>
                                    <img src="/images/annual-report/mission/Projects Illustration.svg" />
                                </div>
                            </MediaQuery>
                            <MediaQuery
                                className="one-p top"
                                maxWidth={frameless.tabletPortrait - 1}
                            >
                                <div className="title-and-description">
                                    <h3><FormattedMessage id="annualReport.missionProjectsTitle" /></h3>
                                    <p><FormattedMessage id="annualReport.missionProjectsDescription" /></p>
                                </div>
                                <div className="small-p four-ps-projects">
                                    <img src="/images/annual-report/mission/Projects Illustration.svg" />
                                </div>
                            </MediaQuery>
                            <MediaQuery minWidth={frameless.tabletPortrait}>
                                <div className="one-p four-ps-passion">
                                    <div className="title-and-description">
                                        <h3><FormattedMessage id="annualReport.missionPassionTitle" /></h3>
                                        <p><FormattedMessage id="annualReport.missionPassionDescription" /></p>
                                    </div>
                                    <img src="/images/annual-report/mission/Passion Illustration.svg" />
                                </div>
                            </MediaQuery>
                            <MediaQuery
                                className="one-p"
                                maxWidth={frameless.tabletPortrait - 1}
                            >
                                <div className="title-and-description">
                                    <h3><FormattedMessage id="annualReport.missionPassionTitle" /></h3>
                                    <p className="no-margin-bottom">
                                        <FormattedMessage id="annualReport.missionPassionDescription" />
                                    </p>
                                </div>
                                <div className="small-p four-ps-passion">
                                    <img src="/images/annual-report/mission/Passion Illustration.svg" />
                                </div>
                            </MediaQuery>
                            <MediaQuery minWidth={frameless.tabletPortrait}>
                                <div className="one-p four-ps-peers">
                                    <div className="title-and-description">
                                        <h3><FormattedMessage id="annualReport.missionPeersTitle" /></h3>
                                        <p><FormattedMessage id="annualReport.missionPeersDescription" /></p>
                                    </div>
                                    <img src="/images/annual-report/mission/Peers Illustration.svg" />
                                </div>
                            </MediaQuery>
                            <MediaQuery
                                className="one-p"
                                maxWidth={frameless.tabletPortrait - 1}
                            >
                                <div className="title-and-description">
                                    <h3><FormattedMessage id="annualReport.missionPeersTitle" /></h3>
                                    <p><FormattedMessage id="annualReport.missionPeersDescription" /></p>
                                </div>
                                <div className="small-p four-ps-peers">
                                    <img src="/images/annual-report/mission/Peers Illustration.svg" />
                                </div>
                            </MediaQuery>
                            <MediaQuery minWidth={frameless.tabletPortrait}>
                                <div className="one-p four-ps-play">
                                    <div className="title-and-description">
                                        <h3><FormattedMessage id="annualReport.missionPlayTitle" /></h3>
                                        <p><FormattedMessage id="annualReport.missionPlayDescription" /></p>
                                    </div>
                                    <img src="/images/annual-report/mission/Play Illustration.svg" />
                                </div>
                            </MediaQuery>
                            <MediaQuery
                                className="one-p"
                                maxWidth={frameless.tabletPortrait - 1}
                            >
                                <div className="title-and-description">
                                    <h3><FormattedMessage id="annualReport.missionPlayTitle" /></h3>
                                    <p><FormattedMessage id="annualReport.missionPlayDescription" /></p>
                                </div>
                                <div className="small-p four-ps-play">
                                    <img src="/images/annual-report/mission/Play Illustration.svg" />
                                </div>
                            </MediaQuery>
                        </div>
                    </div>
                    <div
                        className="reach-section"
                        ref={this.setRef(SECTIONS.reach)}
                    >
                        <div className="inner">
                            <div className="reach-intro">
                                <div className="hed">
                                    <h2>
                                        <FormattedMessage id="annualReport.reachTitle" />
                                    </h2>
                                    <p>
                                        <FormattedMessage id="annualReport.reachSubtitle" />
                                    </p>
                                </div>
                                <img src="/images/annual-report/2020/data/Calendar.svg" />
                                <div className="reach-numbers">
                                    <div className="reach-datapoint">
                                        <FormattedMessage
                                            id="annualReport.reachNewUsersNumber"
                                            values={{
                                                million: (
                                                    <div className="million">
                                                        <FormattedMessage id="annualReport.reachMillion" />
                                                    </div>
                                                )
                                            }}
                                        />
                                        <h4>
                                            <FormattedMessage id="annualReport.reachNewUsers" />
                                        </h4>
                                        <div className="increase bubble">
                                            <FormattedMessage id="annualReport.reachNewUsersIncrease" />
                                        </div>
                                    </div>
                                    <div className="reach-datapoint">
                                        <FormattedMessage
                                            id="annualReport.reachProjectsCreatedNumber"
                                            values={{
                                                million: (
                                                    <div className="million">
                                                        <FormattedMessage id="annualReport.reachMillion" />
                                                    </div>
                                                )
                                            }}
                                        />
                                        <h4>
                                            <FormattedMessage id="annualReport.reachProjectsCreated" />
                                        </h4>
                                        <div className="increase bubble">
                                            <FormattedMessage id="annualReport.reachProjectsCreatedIncrease" />
                                        </div>
                                    </div>
                                    <div className="reach-datapoint">
                                        <FormattedMessage
                                            id="annualReport.reachProjectCreatorsNumber"
                                            values={{
                                                million: (
                                                    <div className="million">
                                                        <FormattedMessage id="annualReport.reachMillion" />
                                                    </div>
                                                )
                                            }}
                                        />
                                        <h4>
                                            <FormattedMessage id="annualReport.reachProjectCreators" />
                                        </h4>
                                        <div className="increase bubble">
                                            <FormattedMessage id="annualReport.reachProjectCreatorsIncrease" />
                                        </div>
                                    </div>
                                    <img className="comment-viz" src="/images/annual-report/2020/data/Comments-visualization.svg" />
                                    <div className="reach-datapoint increase">
                                        <FormattedMessage
                                            id="annualReport.reachIncreaseInCommentsNumber"
                                        />
                                        <h4>
                                            <FormattedMessage id="annualReport.reachComments" />
                                        </h4>
                                        <div className="bubble">
                                            <FormattedMessage
                                            id="annualReport.reachIncreaseInCommentsOld"
                                            values={{
                                                million: (
                                                    <FormattedMessage id="annualReport.reachMillion" />
                                                )
                                            }}
                                            />
                                            <img src="/images/annual-report/2020/Symbols-UI/Arrow_Next.svg" />
                                            <FormattedMessage
                                            id="annualReport.reachIncreaseInCommentsIncrease"
                                            values={{
                                                million: (
                                                    <FormattedMessage id="annualReport.reachMillion" />
                                                )
                                            }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="map-inner">
                            <div className="reach-map">
                                <h3>
                                    <FormattedMessage id="annualReport.reachGlobalCommunity" />
                                </h3>
                                <p>
                                    <FormattedMessage id="annualReport.reachMapBlurb" />
                                </p>
                                <div className="map-key">
                                    <div className="map-scale">
                                        <div>0</div>
                                        <img src="/images/annual-report/reach/Map Key.svg" />
                                        <div>
                                            <FormattedMessage id="annualReport.reachMap20M" />
                                        </div>
                                    </div>
                                    <div>
                                        <FormattedMessage id="annualReport.reachMapLog" />
                                    </div>
                                </div>
                                <div className="map-wrapper">
                                    <MediaQuery minWidth={frameless.desktop}>
                                        <WorldMap
                                            className="map"
                                            colorIndex={colorIndex}
                                            countryData={countryData}
                                            countryNames={countryNames}
                                        />
                                    </MediaQuery>
                                    <MediaQuery
                                        maxWidth={frameless.desktop - 1}
                                        minWidth={frameless.tabletPortrait}
                                    >
                                        <WorldMap
                                            className="map"
                                            colorIndex={colorIndex}
                                            countryData={countryData}
                                            countryNames={countryNames}
                                        />
                                    </MediaQuery>
                                    <MediaQuery
                                        maxWidth={frameless.tabletPortrait - 1}
                                        minWidth={frameless.mobileIntermediate}
                                    >
                                        <WorldMap
                                            className="map"
                                            colorIndex={colorIndex}
                                            countryData={countryData}
                                            countryNames={countryNames}
                                        />
                                    </MediaQuery>
                                    <MediaQuery maxWidth={frameless.mobileIntermediate - 1}>
                                        <WorldMap
                                            className="map"
                                            colorIndex={colorIndex}
                                            countryData={countryData}
                                            countryNames={countryNames}
                                        />
                                    </MediaQuery>
                                </div>
                            </div>
                        </div>
                        <div className="inner">
                            <div className="reach-translation">
                                <div className="reach-translation-intro">
                                    <h3>
                                        <FormattedMessage id="annualReport.reachTranslationTitle" />
                                    </h3>
                                    <div className="inline">
                                        <img src="/images/annual-report/2020/Symbols-UI/Arrow_up.svg" />
                                        <FormattedMessage id="annualReport.reachTranslationIncrease" />
                                    </div>
                                    <p>
                                        <FormattedMessage id="annualReport.reachTranslationBlurb" />
                                    </p>
                                </div>
                                <img src="/images/annual-report/2020/data/translated-illustration.svg" />
                            </div>
                        </div>
                        <MediaQuery minWidth={frameless.mobile}>
                            <div className="scratch-jr-transition-img">
                                <img src="/images/annual-report/reach/horizontal-command.svg" />
                            </div>
                        </MediaQuery>
                    </div>
                    <div className="reach-scratch-jr">
                        <div className="inner">
                            <div className="scratch-jr-intro">
                                <img src="/images/annual-report/2020/data/ScratchJr_Logo.svg" />
                                <p>
                                    <FormattedMessage id="annualReport.reachScratchJrBlurb" />
                                </p>
                            </div>
                            <div className="reach-datapoint">
                                <FormattedMessage
                                    id="annualReport.reachDownloadsMillion"
                                    values={{
                                        million: (
                                            <div className="million">
                                                <FormattedMessage id="annualReport.reachMillion" />
                                            </div>
                                        )
                                    }}
                                />
                                <h4>
                                    <FormattedMessage id="annualReport.reachDownloads" />
                                </h4>
                                <div className="increase bubble dark">
                                    <FormattedMessage id="annualReport.reachDownloadsIncrease" />
                                </div>
                            </div>
                        </div>
                        <MediaQuery minWidth={frameless.mobile}>
                            <div className="scratch-jr-transition-img">
                                <img src="/images/annual-report/reach/horizontal-loop.svg" />
                            </div>
                        </MediaQuery>
                    </div>
                    <div
                        className="initiatives-section"
                        ref={this.setRef(SECTIONS.themes)}
                    >
                        <div className="initiatives-intro">
                            <div className="inner">
                                <h2>
                                    <FormattedMessage id="annualReport.themesTitle" />
                                </h2>
                                <p>
                                    <FormattedMessage id="annualReport.themesDescription" />
                                </p>
                                <div className="initiatives-pillars">
                                    <div className="three-pillars">
                                        <div className="pillar-splash">
                                            <h4>
                                                <FormattedMessage id="annualReport.connectivityTitle" />
                                            </h4>
                                        </div>
                                        <div className="pillar-splash">
                                            <h4>
                                                <FormattedMessage id="annualReport.adaptationTitle" />
                                            </h4>
                                        </div>
                                        <div className="pillar-splash">
                                            <h4>
                                                <FormattedMessage id="annualReport.communityTitle" />
                                            </h4>
                                        </div>
                                    </div>
                                    <div className="equity-and-global">
                                        <div className="pillar-splash">
                                            <h4>
                                                <FormattedMessage id="annualReport.equity" />
                                            </h4>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="initiatives-connectivity">
                            <div className="initiatives-subsection-header connectivity">
                                <div className="inner">
                                    <h2>
                                        <FormattedMessage id="annualReport.connectivityTitle" />
                                    </h2>
                                    <p>
                                        <FormattedMessage id="annualReport.connectivityIntro" />
                                    </p>
                                </div>
                            </div>
                            <div className="initiatives-subsection-content connectivity">
                                {/* eslint-disable max-len */}
                                <div className="inner">
                                    <div className="content">
                                        <div className="text">
                                            <div className="spotlight bubble connectivity">
                                                <FormattedMessage id="annualReport.spotlightStory" />
                                            </div>
                                            <h2>
                                                <FormattedMessage id="annualReport.connectivityIndia" />
                                            </h2>
                                            <p className="larger">
                                                <FormattedMessage id="annualReport.connectivityIndiaIntro" />
                                            </p>
                                        </div>
                                        <div className="images">
                                            <Grid
                                                    showAvatar
                                                    items={IndiaProjects}
                                                    showFavorites={false}
                                                    showLoves={false}
                                                    showViews={false}
                                                />
                                        </div>
                                    </div>
                                    <p className="about-breaker">
                                        <FormattedMessage id="annualReport.connectivityIndiaParagraph" />
                                    </p>
                                    <div className="content around">
                                        <img src="/images/annual-report/2020/connectivity/India_Data/data_projectscreatedonline_graphic.svg" />
                                        <div className="india-numbers">
                                            <h2>
                                                <FormattedMessage
                                                id="annualReport.connectivityIndiaProjectsNumber"
                                                values={{
                                                    million: (
                                                        <span className="million">
                                                            <FormattedMessage id="annualReport.reachMillion" />
                                                        </span>
                                                    )
                                                }}
                                            />
                                            </h2>
                                            <h4>
                                                <FormattedMessage id="annualReport.connectivityIndiaProjectsSubhead" />
                                            </h4>
                                            <div className="increase bubble inverted">
                                                <FormattedMessage id="annualReport.connectivityIndiaProjectsIncreasePercent" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="content around users">
                                        <div className="users-text">
                                            <p>
                                                <span className="bold">
                                                    <FormattedMessage id="annualReport.connectivityRegistedUsers" />
                                                </span>
                                                <FormattedMessage id="annualReport.connectivityRegistedUsersNumbers" />
                                            </p>
                                        </div>
                                        <img src="/images/annual-report/2020/connectivity/India_Data/data_alltimeusers_graphic.svg" />
                                    </div>
                                    <div className="content around users">
                                        <div className="stats">
                                            <p className="bold">
                                                <FormattedMessage id="annualReport.connectivityIndiaUsers" />
                                            </p>
                                            <h2>
                                                <FormattedMessage id="annualReport.connectivityIndiaUsersPercent" />
                                            </h2>
                                            <p className="bold">
                                                <FormattedMessage id="annualReport.connectivityIndiaYear" />
                                            </p>
                                            <div className="bubble inverted">
                                                <FormattedMessage
                                                id="annualReport.connectivityIndiaUsersOld"
                                                values={{
                                                    million: (
                                                        <FormattedMessage id="annualReport.reachMillion" />
                                                    )
                                                }}
                                                />
                                                <img src="/images/annual-report/2020/Symbols-UI/Arrow_Next_purple.svg" />
                                                <FormattedMessage
                                                id="annualReport.connectivityIndiaUsersNew"
                                                values={{
                                                    million: (
                                                        <FormattedMessage id="annualReport.reachMillion" />
                                                    )
                                                }}
                                                />
                                            </div>
                                        </div>
                                        <div className="stats">
                                            <p className="bold">
                                                <FormattedMessage id="annualReport.connectivityIndiaProjects" />
                                            </p>
                                            <h2>
                                                <FormattedMessage id="annualReport.connectivityIndiaProjectsPercent" />
                                            </h2>
                                            <p className="bold">
                                                <FormattedMessage id="annualReport.connectivityIndiaYear" />
                                            </p>
                                            <div className="bubble inverted">
                                                <FormattedMessage
                                                id="annualReport.connectivityIndiaProjectsOld" />
                                                <img src="/images/annual-report/2020/Symbols-UI/Arrow_Next_purple.svg" />
                                                <FormattedMessage
                                                id="annualReport.connectivityIndiaProjectsNew"
                                                values={{
                                                    million: (
                                                        <FormattedMessage id="annualReport.reachMillion" />
                                                    )
                                                }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="world">
                                        <div className="spotlight bubble connectivity">
                                            <FormattedMessage id="annualReport.spotlightStory" />
                                        </div>
                                        <h2>
                                            <FormattedMessage id="annualReport.connectivityWorld" />
                                        </h2>
                                        <p className="bold">
                                            <FormattedMessage id="annualReport.connectivityWorldSubtitle" />
                                        </p>
                                    </div>
                                    {/* <div className="big-video"> */}
                                    <div className="video-container">
                                        <MediaQuery minWidth={frameless.tabletPortrait}>
                                            <VideoPreview
                                                buttonMessage={
                                                    this.props.intl.formatMessage({id: 'annualReport.watchVideo'})
                                                }
                                                thumbnail="/images/annual-report/2020/connectivity/Scratch Around the World Video.svg"
                                                thumbnailWidth="1000"
                                                videoHeight="450"
                                                videoId="rlsjbx0st4"
                                                videoWidth="700"
                                            />
                                        </MediaQuery>
                                        <MediaQuery
                                            maxWidth={frameless.tabletPortrait - 1}
                                            minWidth={frameless.mobile}
                                        >
                                            <VideoPreview
                                                buttonMessage={
                                                    this.props.intl.formatMessage({id: 'annualReport.watchVideo'})
                                                }
                                                thumbnail="/images/annual-report/2020/connectivity/Scratch Around the World Video.svg"
                                                thumbnailWidth="800"
                                                videoHeight="320"
                                                videoId="rlsjbx0st4"
                                                videoWidth="568"
                                            />
                                        </MediaQuery>
                                        <MediaQuery maxWidth={frameless.mobile - 1}>
                                            <VideoPreview
                                                buttonMessage={
                                                    this.props.intl.formatMessage({id: 'annualReport.watchVideo'})
                                                }
                                                thumbnail="/images/annual-report/2020/connectivity/Scratch Around the World Video.svg"
                                                thumbnailWidth="500"
                                                videoHeight="216"
                                                videoId="rlsjbx0st4"
                                                videoWidth="380"
                                            />
                                        </MediaQuery>
                                    </div>
                                    {/* </div> */}
                                    <div className="flex-content">
                                        <CountryBlurb
                                            className="reverse"
                                            icon="/images/annual-report/2020/connectivity/Scratch Around the World/Scratch Al Sur logo.png"
                                            title={this.props.intl.formatMessage(
                                                {id: 'annualReport.connectivityCountryChileTitle'}
                                            )}
                                            list_icon="/images/annual-report/2020/Symbols-UI/Location_icon.svg"
                                            country={this.props.intl.formatMessage(
                                                {id: 'annualReport.connectivityCountryChile'}
                                            )}
                                            paragraph={this.props.intl.formatMessage(
                                                {id: 'annualReport.connectivityCountryChileParagraph'}
                                            )}
                                            large_image="/images/annual-report/2020/connectivity/Scratch Around the World/Scratch Al Sur graphic.svg"
                                        />
                                        <CountryBlurb
                                            className="regular"
                                            icon="/images/annual-report/2020/connectivity/Scratch Around the World/Brazil Creative Learning Network logo.png"
                                            title={this.props.intl.formatMessage(
                                                {id: 'annualReport.connectivityCountryBrazilTitle'}
                                            )}
                                            list_icon="/images/annual-report/2020/Symbols-UI/Location_icon.svg"
                                            country={this.props.intl.formatMessage(
                                                {id: 'annualReport.connectivityCountryBrazil'}
                                            )}
                                            paragraph={this.props.intl.formatMessage(
                                                {id: 'annualReport.connectivityCountryBrazilParagraph'}
                                            )}
                                            large_image="/images/annual-report/2020/connectivity/Scratch Around the World/Brazil Creative Learning Network graphic.svg"
                                        />
                                        <CountryBlurb
                                            className="reverse"
                                            icon="/images/annual-report/2020/connectivity/Scratch Around the World/Quest Alliance logo.png"
                                            title={this.props.intl.formatMessage(
                                                {id: 'annualReport.connectivityCountryIndiaTitle'}
                                            )}
                                            list_icon="/images/annual-report/2020/Symbols-UI/Location_icon.svg"
                                            country={this.props.intl.formatMessage(
                                                {id: 'annualReport.connectivityCountryIndia'}
                                            )}
                                            paragraph={this.props.intl.formatMessage(
                                                {id: 'annualReport.connectivityCountryIndiaParagraph'}
                                            )}
                                            large_image="/images/annual-report/2020/connectivity/Scratch Around the World/Quest Alliance graphic.svg"
                                        />
                                        <CountryBlurb
                                            className="regular"
                                            icon="/images/annual-report/2020/connectivity/Scratch Around the World/Raspberry Pi logo.png"
                                            title={this.props.intl.formatMessage(
                                                {id: 'annualReport.connectivityCountryUSATitle'}
                                            )}
                                            list_icon="/images/annual-report/2020/Symbols-UI/Location_icon.svg"
                                            country={this.props.intl.formatMessage(
                                                {id: 'annualReport.connectivityCountryUSA'}
                                            )}
                                            paragraph={this.props.intl.formatMessage(
                                                {id: 'annualReport.connectivityCountryUSAParagraph'}
                                            )}
                                            large_image="/images/annual-report/2020/connectivity/Scratch Around the World/Raspberry Pi graphic.svg"
                                        />
                                    </div>
                                    <div className="resources">
                                        <h2>
                                            <FormattedMessage id="annualReport.connectivityResources" />
                                        </h2>
                                        <p className="bold">
                                            <FormattedMessage id="annualReport.connectivityResourcesSubtitle" />
                                        </p>
                                        <p>
                                            <FormattedMessage id="annualReport.connectivityResourcesParagraph" />
                                        </p>
                                    </div>
                                    <div className="flex-content">
                                        <AnnualReportExample
                                            className="reverse"
                                            title={this.props.intl.formatMessage(
                                                {id: 'annualReport.connectivityExample1Title'}
                                            )}
                                            paragraph={this.props.intl.formatMessage(
                                                {id: 'annualReport.connectivityExample1Paragraph'}
                                            )}
                                            type="image"
                                            large_image="/images/annual-report/2020/connectivity/TutorialUI.svg"
                                        />
                                        <AnnualReportExample
                                            className="regular"
                                            title={this.props.intl.formatMessage(
                                                {id: 'annualReport.connectivityExample2Title'}
                                            )}
                                            paragraph={this.props.intl.formatMessage(
                                                {id: 'annualReport.connectivityExample2Paragraph'}
                                            )}
                                            type="video"
                                            video_id="xfh9bvbeik"
                                            large_image="/images/annual-report/2020/connectivity/Getting Started with Scratch video.png"
                                        />
                                        <AnnualReportExample
                                            className="full-width"
                                            title={this.props.intl.formatMessage(
                                                {id: 'annualReport.connectivityExample3Title'}
                                            )}
                                            paragraph={this.props.intl.formatMessage(
                                                {id: 'annualReport.connectivityExample3Paragraph'}
                                            )}
                                            type="image"
                                            large_image="/images/annual-report/2020/connectivity/isiXhosa_scratcheditor.jpg"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="initiatives-adaptation">
                            <div className="initiatives-subsection-header adaptation">
                                <div className="inner">
                                    <h2>
                                        <FormattedMessage id="annualReport.adaptationTitle" />
                                    </h2>
                                    <p>
                                        <FormattedMessage id="annualReport.adaptationIntro" />
                                    </p>
                                </div>
                            </div>
                            <div className="community-quotes">
                                <div className="community-quote">
                                    <div className="quote-person">
                                        <Avatar
                                            alt=""
                                            src="/images/annual-report/2020/adaptation/quote_benedikthochwartner.svg"
                                        />
                                        <div>
                                            <h5>
                                                <FormattedMessage id="annualReport.adaptationQuoteName" />
                                            </h5>
                                            <p>
                                                <FormattedMessage id="annualReport.adaptationQuoteTitle" />
                                            </p>
                                        </div>
                                    </div>
                                    <Comment
                                        comment={this.props.intl.formatMessage(
                                            {id: 'annualReport.adaptationQuoteText'}
                                        )}
                                    />
                                </div>
                            </div>
                            <div className="initiatives-subsection-content">
                                {/* eslint-disable max-len */}
                                <div className="inner">
                                    <div className="content flex-content">
                                        <div className="text">
                                            <div className="spotlight bubble adaptation">
                                                <FormattedMessage id="annualReport.spotlightStory" />
                                            </div>
                                            <h2>
                                                <FormattedMessage id="annualReport.adaptationHighlightName" />
                                            </h2>
                                            <p className="larger">
                                                <FormattedMessage id="annualReport.adaptationHighlightTitle" />
                                            </p>
                                            <p>
                                                <FormattedMessage id="annualReport.adaptationHighlightText" />
                                            </p>
                                        </div>
                                        <div className="images">
                                            <img src="/images/annual-report/2020/adaptation/Aaron Reuland Illustration_Photo.svg" />
                                        </div>
                                    </div>
                                    <div className="flex-content">
                                        <AnnualReportExample
                                            className="regular"
                                            paragraph={this.props.intl.formatMessage(
                                                {id: 'annualReport.adaptationHighlightText2'}
                                            )}
                                            type="image"
                                            large_image="/images/annual-report/2020/adaptation/Aaron Reuland - Class Projects 1.png"
                                        />
                                    </div>
                                    <div className="world">
                                        <div className="spotlight bubble adaptation">
                                            <FormattedMessage id="annualReport.spotlightStory" />
                                        </div>
                                        <h2>
                                            <FormattedMessage id="annualReport.adaptationHighlightTitle2" />
                                        </h2>
                                        <p>
                                            <FormattedMessage id="annualReport.adaptationHighlightText2b" />
                                        </p>
                                    </div>
                                    <div className="world">
                                        <h4>
                                            <FormattedMessage id="annualReport.adaptationHighlightTitle3" />
                                        </h4>
                                        <p>
                                            <FormattedMessage id="annualReport.adaptationHighlightText3b" />
                                        </p>
                                    </div>
                                    <div className="video-container">
                                        <MediaQuery minWidth={frameless.tabletPortrait}>
                                            <VideoPreview
                                                buttonMessage={
                                                    this.props.intl.formatMessage({id: 'annualReport.watchVideo'})
                                                }
                                                thumbnail="/images/annual-report/2020/adaptation/Create-along video.svg"
                                                thumbnailWidth="1000"
                                                videoHeight="320"
                                                videoId="IGDCZGfj_cQ"
                                                videoWidth="568"
                                            />
                                        </MediaQuery>
                                        <MediaQuery
                                            maxWidth={frameless.tabletPortrait - 1}
                                            minWidth={frameless.mobile}
                                        >
                                            <VideoPreview
                                                buttonMessage={
                                                    this.props.intl.formatMessage({id: 'annualReport.watchVideo'})
                                                }
                                                thumbnail="/images/annual-report/2020/adaptation/Create-along video.svg"
                                                thumbnailWidth="800"
                                                videoHeight="320"
                                                videoId="IGDCZGfj_cQ"
                                                videoWidth="568"
                                            />
                                        </MediaQuery>
                                        <MediaQuery maxWidth={frameless.mobile - 1}>
                                            <VideoPreview
                                                buttonMessage={
                                                    this.props.intl.formatMessage({id: 'annualReport.watchVideo'})
                                                }
                                                thumbnail="/images/annual-report/2020/adaptation/Create-along video.svg"
                                                thumbnailWidth="500"
                                                videoHeight="216"
                                                videoId="IGDCZGfj_cQ"
                                                videoWidth="380"
                                            />
                                        </MediaQuery>
                                    </div>

                                    <div className="flex-content">
                                        <AnnualReportExample
                                            className="regular"
                                            title={this.props.intl.formatMessage(
                                                {id: 'annualReport.adaptationHighlightTitle4'}
                                            )}
                                            paragraph={this.props.intl.formatMessage(
                                                {id: 'annualReport.adaptationHighlightText4b'}
                                            )}
                                            type="image"
                                            large_image="/images/annual-report/2020/adaptation/hackyourwindow_gif.gif"
                                        />
                                    </div>
                                    <div className="left-align">
                                        <h5><FormattedMessage id="annualReport.adaptationEducatorsTitle" /></h5>
                                        <p><FormattedMessage id="annualReport.adaptationEducatorsText" /></p>
                                    </div>
                                </div>
                                <div className="tweet-container">
                                    <div className="tweets">
                                        <TwitterTweetEmbed
                                            tweetId={'1247966777503551489'}
                                        />
                                        <TwitterTweetEmbed
                                            tweetId={'1247968609806229505'}
                                        />
                                    </div>
                                </div>
                                <div className="inner">
                                    <div className="snapshot bubble adaptation">
                                        <FormattedMessage id="annualReport.adaptationSnapshot" />
                                    </div>
                                    <div className="flex-content lg">
                                        <AnnualReportExample
                                            className="regular"
                                            title={this.props.intl.formatMessage(
                                                {id: 'annualReport.adaptationSnapshot1Title'}
                                            )}
                                            paragraph={this.props.intl.formatMessage(
                                                {id: 'annualReport.adaptationSnapshot1Text'}
                                            )}
                                            type="image"
                                            large_image="/images/annual-report/2020/adaptation/Computer Clubhouse Illustration.svg"
                                        />
                                    </div>
                                    <div className="flex-content lg">
                                        <AnnualReportExample
                                            className="reverse"
                                            title={this.props.intl.formatMessage(
                                                {id: 'annualReport.adaptationSnapshot2Title'}
                                            )}
                                            paragraph={this.props.intl.formatMessage(
                                                {id: 'annualReport.adaptationSnapshot2Text'}
                                            )}
                                            type="image"
                                            large_image="/images/annual-report/2020/adaptation/BYIS Graphic.svg"
                                        />
                                    </div>          

                                    <div className="subsection-tag">
                                        <FormattedMessage id="annualReport.communitySpotlight" />
                                    </div>
                                    <div className="initiatives-subsection-intro">
                                        <h2>
                                            <FormattedMessage id="annualReport.communityTeam" />
                                        </h2>
                                        <p>
                                            <FormattedMessage id="annualReport.communityTeamIntro1" />
                                        </p>
                                        <p>
                                            <FormattedMessage id="annualReport.communityTeamIntro2" />
                                        </p>
                                    </div>
                                </div>
                                <div className="community-hero-img" />
                                <div className="inner">
                                    <div className="moderation-and-guidelines">
                                        <div className="community-moderation">
                                            <h4>
                                                <FormattedMessage id="annualReport.communityModerationTitle" />
                                            </h4>
                                            <p>
                                                <FormattedMessage id="annualReport.communityModerationInfo" />
                                            </p>
                                        </div>
                                        <div className="community-guidelines">
                                            <h4>
                                                <FormattedMessage id="annualReport.communityGuidelinesTitle" />
                                            </h4>
                                            <p>
                                                <FormattedMessage id="annualReport.communityGuidelinesInfo" />
                                            </p>
                                            <div className="guidelines-list">
                                                <ul>
                                                    <li>
                                                        <FormattedMessage
                                                            id="annualReport.communityGuidelinesRespect"
                                                        />
                                                    </li>
                                                    <li>
                                                        <FormattedMessage id="annualReport.communityGuidelinesShare" />
                                                    </li>
                                                    <li>
                                                        <FormattedMessage id="annualReport.communityGuidelinesHonest" />
                                                    </li>
                                                </ul>
                                                <ul>
                                                    <li>
                                                        <FormattedMessage
                                                            id="annualReport.communityGuidelinesConstructive"
                                                        />
                                                    </li>
                                                    <li>
                                                        <FormattedMessage
                                                            id="annualReport.communityGuidelinesPrivacy"
                                                        />
                                                    </li>
                                                    <li>
                                                        <FormattedMessage
                                                            id="annualReport.communityGuidelinesFriendly"
                                                        />
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="community-engagement">
                                        <h4>
                                            <FormattedMessage id="annualReport.communityEngagementTitle" />
                                        </h4>
                                        <p>
                                            <FormattedMessage
                                                id="annualReport.communityEngagementInfo"
                                                values={{
                                                    storySwapLink: (
                                                        <a
                                                            href="/studios/25034966/"
                                                            target="_blank"
                                                        >
                                                            <FormattedMessage id="annualReport.storySwap" />
                                                        </a>
                                                    )
                                                }}
                                            />
                                        </p>
                                    </div>
                                    <div className="community-sds">
                                        <h3>
                                            <FormattedMessage id="annualReport.communitySDSTitle" />
                                        </h3>
                                        <p>
                                            <FormattedMessage id="annualReport.communitySDSInfo" />
                                        </p>
                                        <div className="sds-list">
                                            <div className="sds-tile">
                                                <a
                                                    href="/studios/6234813/"
                                                    target="_blank"
                                                >
                                                    <img
                                                        src="/images/annual-report/initiatives/Day in the Life Thumbnail.png"
                                                    />
                                                    <FormattedMessage id="annualReport.communityDayintheLife" />
                                                </a>
                                                <p>
                                                    <FormattedMessage id="annualReport.communityDayintheLifeInfo" />
                                                </p>
                                            </div>
                                            <div className="sds-tile">
                                                <a
                                                    href="/studios/5801323/"
                                                    target="_blank"
                                                >
                                                    <img
                                                        src="/images/annual-report/initiatives/Year 3000 Thumbnail.png"
                                                    />
                                                    <FormattedMessage id="annualReport.communityYear3000" />
                                                </a>
                                                <p>
                                                    <FormattedMessage id="annualReport.communityYear3000Info" />
                                                </p>
                                            </div>
                                            <div className="sds-tile">
                                                <a
                                                    href="/studios/5702799/"
                                                    target="_blank"
                                                >
                                                    <img
                                                        src="/images/annual-report/initiatives/Bounce Thumbnail.png"
                                                    />
                                                    <FormattedMessage id="annualReport.communityBounce" />
                                                </a>
                                                <p>
                                                    <FormattedMessage id="annualReport.communityBounceInfo" />
                                                </p>
                                            </div>
                                            <div className="sds-tile">
                                                <a
                                                    href="/studios/5944573/"
                                                    target="_blank"
                                                >
                                                    <img
                                                        src="/images/annual-report/initiatives/Monochromatic Thumbnail.png"
                                                    />
                                                    <FormattedMessage id="annualReport.communityMonochromatic" />
                                                </a>
                                                <p>
                                                    <FormattedMessage id="annualReport.communityMonochromaticInfo" />
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="subsection-tag quotes-tag">
                                        <FormattedMessage id="annualReport.communityQuotes" />
                                    </div>
                                    <div className="community-quotes">
                                        <div className="community-quote">
                                            <div className="quote-person">
                                                <Avatar
                                                    alt=""
                                                    src="https://cdn.scratch.mit.edu/get_image/user/36591_80x80.png"
                                                />
                                                <div>angelical</div>
                                            </div>
                                            <Comment
                                                comment={this.props.intl.formatMessage(
                                                    {id: 'annualReport.communityQuote1'}
                                                )}
                                            />
                                        </div>
                                        <div className="community-quote">
                                            <div className="quote-person">
                                                <Avatar
                                                    alt=""
                                                    src="https://cdn.scratch.mit.edu/get_image/user/61442584_80x80.png"
                                                />
                                                <div>dlore2009</div>
                                            </div>
                                            <Comment
                                                comment={this.props.intl.formatMessage(
                                                    {id: 'annualReport.communityQuote2'}
                                                )}
                                            />
                                        </div>
                                        <div className="community-quote">
                                            <div className="quote-person">
                                                <Avatar
                                                    alt=""
                                                    src="https://cdn.scratch.mit.edu/get_image/user/56150500_80x80.png"
                                                />
                                                <div>qood</div>
                                            </div>
                                            <Comment
                                                comment={this.props.intl.formatMessage(
                                                    {id: 'annualReport.communityQuote3'}
                                                )}
                                            />
                                        </div>
                                        <div className="community-quote">
                                            <div className="quote-person">
                                                <Avatar
                                                    alt=""
                                                    src="https://cdn.scratch.mit.edu/get_image/user/176301_80x80.png"
                                                />
                                                <div>Mechanical_pencil</div>
                                            </div>
                                            <Comment
                                                comment={this.props.intl.formatMessage(
                                                    {id: 'annualReport.communityQuote4'}
                                                )}
                                            />
                                        </div>
                                    </div>
                                    <div className="subsection-tag blm-tag">
                                        <FormattedMessage id="annualReport.communitySpotlight" />
                                    </div>
                                    <div className="community-blm">
                                        <div className="blm-intro">
                                            <h2>Black Lives Matter</h2>
                                            <p>
                                                <FormattedMessage
                                                    id="annualReport.communityBLMIntro"
                                                    values={{
                                                        BLMStudioLink: (
                                                            <a
                                                                href="/studios/26964367"
                                                                target="_blank"
                                                            >
                                                                Black Lives Matter <FormattedMessage
                                                                    id="annualReport.studio"
                                                                />
                                                            </a>
                                                        )
                                                    }}
                                                />
                                            </p>
                                        </div>
                                        <div className="blm-image">
                                            <img src="/images/annual-report/initiatives/BLM Hero.svg" />
                                            <span className="photo-credit">
                                                <FormattedMessage id="annualReport.communityArtwork" />
                                            </span>
                                        </div>
                                        <div className="blm-projects">
                                            <Grid
                                                showAvatar
                                                items={BLMProjects}
                                                showFavorites={false}
                                                showLoves={false}
                                                showViews={false}
                                            />
                                        </div>
                                        <div className="blm-change">
                                            <h3>
                                                <FormattedMessage id="annualReport.communityChangeTitle" />
                                            </h3>
                                            <p>
                                                <FormattedMessage id="annualReport.communityChangeInfo" />
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="video-container">
                                    <div className="video-background blm">
                                        <MediaQuery minWidth={frameless.tabletPortrait}>
                                            <VideoPreview
                                                buttonMessage={
                                                    this.props.intl.formatMessage({id: 'annualReport.watchVideo'})
                                                }
                                                thumbnail="/images/annual-report/initiatives/BLM Video Thumbnail.png"
                                                thumbnailWidth="580"
                                                videoHeight="320"
                                                videoId="r1pmlyylye"
                                                videoWidth="568"
                                            />
                                        </MediaQuery>
                                        <MediaQuery
                                            maxWidth={frameless.tabletPortrait - 1}
                                            minWidth={frameless.mobile}
                                        >
                                            <VideoPreview
                                                buttonMessage={
                                                    this.props.intl.formatMessage({id: 'annualReport.watchVideo'})
                                                }
                                                thumbnail="/images/annual-report/initiatives/BLM Video Thumbnail.png"
                                                thumbnailWidth="400"
                                                videoHeight="320"
                                                videoId="r1pmlyylye"
                                                videoWidth="568"
                                            />
                                        </MediaQuery>
                                        <MediaQuery maxWidth={frameless.mobile - 1}>
                                            <VideoPreview
                                                buttonMessage={
                                                    this.props.intl.formatMessage({id: 'annualReport.watchVideo'})
                                                }
                                                thumbnail="/images/annual-report/initiatives/BLM Video Thumbnail.png"
                                                thumbnailWidth="300"
                                                videoHeight="216"
                                                videoId="r1pmlyylye"
                                                videoWidth="380"
                                            />
                                        </MediaQuery>
                                    </div>
                                </div>
                            </div>
                            {/* eslint-enable max-len */}
                        </div>
                        <div className="initiatives-schools">
                            <div className="initiatives-subsection-header schools">
                                <div className="inner">
                                    {/* <h2>
                                        <FormattedMessage id="annualReport.schoolsTitle" />
                                    </h2> */}
                                    <p>
                                        <FormattedMessage id="annualReport.schoolsIntro" />
                                    </p>
                                </div>
                            </div>
                            <div className="initiatives-subsection-content">
                                <div className="inner schools">
                                    <div className="subsection-tag">
                                        <FormattedMessage id="annualReport.schoolsSpotlight" />
                                    </div>
                                    <div className="initiatives-subsection-intro schools">
                                        <h2>
                                            <FormattedMessage id="annualReport.cpsProjectTitle" />
                                        </h2>
                                        <p>
                                            <FormattedMessage id="annualReport.cpsProjectIntroP1" />
                                        </p>
                                        <p>
                                            <FormattedMessage id="annualReport.cpsProjectIntroP2" />
                                        </p>
                                    </div>
                                </div>
                                <div className="video-container">
                                    <div className="video-background cps">
                                        {/* eslint-disable max-len */}
                                        <MediaQuery minWidth={frameless.tabletPortrait}>
                                            <VideoPreview
                                                buttonMessage={
                                                    this.props.intl.formatMessage({id: 'annualReport.watchVideo'})
                                                }
                                                thumbnail="/images/annual-report/initiatives/schools/CPS Story/CPS Video Thumbnail.png"
                                                thumbnailWidth="580"
                                                videoHeight="320"
                                                videoId="ymkgy1rzch"
                                                videoWidth="568"
                                            />
                                        </MediaQuery>
                                        <MediaQuery
                                            maxWidth={frameless.tabletPortrait - 1}
                                            minWidth={frameless.mobile}
                                        >
                                            <VideoPreview
                                                buttonMessage={
                                                    this.props.intl.formatMessage({id: 'annualReport.watchVideo'})
                                                }
                                                thumbnail="/images/annual-report/initiatives/schools/CPS Story/CPS Video Thumbnail.png"
                                                thumbnailWidth="400"
                                                videoHeight="216"
                                                videoId="ymkgy1rzch"
                                                videoWidth="380"
                                            />
                                        </MediaQuery>
                                        <MediaQuery maxWidth={frameless.mobile - 1}>
                                            <VideoPreview
                                                buttonMessage={
                                                    this.props.intl.formatMessage({id: 'annualReport.watchVideo'})
                                                }
                                                thumbnail="/images/annual-report/initiatives/schools/CPS Story/CPS Video Thumbnail.png"
                                                thumbnailWidth="300"
                                                videoHeight="216"
                                                videoId="ymkgy1rzch"
                                                videoWidth="380"
                                            />
                                        </MediaQuery>
                                        {/* eslint-enable max-len */}
                                    </div>
                                </div>
                                <div className="inner schools">
                                    <h4>
                                        <FormattedMessage id="annualReport.familyCreativeNightsHeader" />
                                    </h4>
                                    <p>
                                        <FormattedMessage id="annualReport.familyCreativeNightsDescription" />
                                    </p>
                                </div>
                                <div className="inner four-pictures-container">
                                    <div className="pencils-img">
                                        <img src="/images/annual-report/initiatives/schools/CPS Story/Pencils.svg" />
                                    </div>
                                    <div className="four-pictures">
                                        {/* eslint-disable max-len */}
                                        <img src="/images/annual-report/initiatives/schools/CPS Story/Family Night 1.png" />
                                        <img src="/images/annual-report/initiatives/schools/CPS Story/Family Night 2.png" />
                                        <img src="/images/annual-report/initiatives/schools/CPS Story/Family Night 3.png" />
                                        <img src="/images/annual-report/initiatives/schools/CPS Story/Family Night 4.png" />
                                        {/* eslint-enable max-len */}
                                    </div>
                                    <div className="pizza-img">
                                        <img src="/images/annual-report/initiatives/schools/CPS Story/Pizza.svg" />
                                    </div>
                                    <span className="photo-credit">
                                        <FormattedMessage id="annualReport.familyNightsPhotoCredit" />
                                    </span>
                                </div>
                                <div className="inner schools">
                                    <h4>
                                        <FormattedMessage id="annualReport.teacherPDHeader" />
                                    </h4>
                                    <p>
                                        <FormattedMessage id="annualReport.teacherPDDescription" />
                                    </p>
                                    <div className="teacher-quote">
                                        <div className="quote-person">
                                            {/* eslint-disable max-len */}
                                            <Avatar
                                                alt=""
                                                src="/images/annual-report/initiatives/schools/CPS Story/School Quote Avatar.png"
                                            />
                                            {/* eslint-enable max-len */}
                                            <div>
                                                <FormattedMessage
                                                    id="annualReport.teacherPDQuoteAttribution"
                                                    values={{
                                                        teacherName: 'Mahmoud Aliamer'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <Comment
                                            comment={this.props.intl.formatMessage(
                                                {id: 'annualReport.teacherPDQuote'}
                                            )}
                                        />
                                    </div>
                                    <div className="extending-reach">
                                        <h4>
                                            <FormattedMessage id="annualReport.extendingReachHeader" />
                                        </h4>
                                        <p>
                                            <FormattedMessage
                                                id="annualReport.extendingReachDescription"
                                                values={{
                                                    codeYourHeroLink: (
                                                        <a
                                                            href="https://csfirst.withgoogle.com/c/cs-first/en/code-your-hero/overview.html"
                                                            rel="noreferrer noopener"
                                                            target="_blank"
                                                        >
                                                            <FormattedMessage id="annualReport.codeYourHero" />
                                                        </a>
                                                    )
                                                }}
                                            />
                                        </p>
                                    </div>
                                    <h4>
                                        <FormattedMessage id="annualReport.inTheNewsHeader" />
                                    </h4>
                                    <div className="news-links">
                                        {/* eslint-disable max-len */}
                                        <div className="icon-and-link">
                                            <img src="/images/annual-report/initiatives/schools/CPS Story/News Icon.svg" />
                                            <a
                                                href="https://chicago.suntimes.com/2019/12/9/21003124/chance-rapper-superme-i-love-you-so-much-cps-public-schools-video-game-google"
                                                rel="noreferrer noopener"
                                                target="_blank"
                                            >
                                                <FormattedMessage id="annualReport.chicagoSunTimesArticle" />
                                            </a>
                                        </div>
                                        <div className="icon-and-link">
                                            <img src="/images/annual-report/initiatives/schools/CPS Story/News Icon.svg" />
                                            <a
                                                href="https://www.rollingstone.com/music/music-news/chance-the-rapper-i-love-you-so-much-video-game-made-by-chicago-students-925198/"
                                                rel="noreferrer noopener"
                                                target="_blank"
                                            >
                                                <FormattedMessage id="annualReport.rollingStoneArticle" />
                                            </a>
                                        </div>
                                        {/* eslint-enable max-len */}
                                    </div>
                                </div>
                                <div className="inner schools-conferences">
                                    <div className="schools-conferences-header">
                                        <div className="subsection-tag">
                                            <FormattedMessage id="annualReport.schoolsSpotlight" />
                                        </div>
                                        <h2>
                                            <FormattedMessage id="annualReport.conferencesTitle" />
                                        </h2>
                                    </div>
                                    <div className="schools-conferences-intro">
                                        <p>
                                            <FormattedMessage id="annualReport.conferencesIntro" />
                                        </p>
                                        <MediaQuery minWidth={frameless.mobile}>
                                            <div className="conferences-hero-and-caption">
                                                {/* eslint-disable-next-line max-len */}
                                                <img src="/images/annual-report/initiatives/schools/Conferences Story/Scratch Conferences Hero.png" />
                                                <span className="photo-credit">
                                                    <FormattedMessage
                                                        id="annualReport.conferencesHeroImageCaption"
                                                        values={{
                                                            photoCredit: 'Carmelo Presicce'
                                                        }}
                                                    />
                                                </span>
                                            </div>
                                        </MediaQuery>
                                    </div>
                                </div>
                                <MediaQuery maxWidth={frameless.mobile - 1}>
                                    <div className="conferences-hero-and-caption">
                                        <div className="conferences-hero" />
                                        <span className="photo-credit">
                                            <FormattedMessage
                                                id="annualReport.conferencesHeroImageCaption"
                                                values={{
                                                    photoCredit: 'Carmelo Presicce'
                                                }}
                                            />
                                        </span>
                                    </div>
                                </MediaQuery>
                                <div className="inner schools-conferences bottom">
                                    <div className="schools-conferences-content">
                                        <div className="schools-conferences-region">
                                            <div className="conference-image-and-caption left">
                                                {/* eslint-disable-next-line max-len */}
                                                <img src="/images/annual-report/initiatives/schools/Conferences Story/Latin America Conference.png" />
                                                <span className="photo-credit">
                                                    <FormattedMessage
                                                        id="annualReport.conferencesLatinAmericaImageCaption"
                                                        values={{
                                                            photoCredit: 'Scratch al Sur'
                                                        }}
                                                    />
                                                </span>
                                            </div>
                                            <div className="conference-title-and-description">
                                                <h4>
                                                    <FormattedMessage id="annualReport.conferencesLatinAmericaTitle" />
                                                </h4>
                                                <p>
                                                    {/* eslint-disable max-len */}
                                                    <FormattedMessage
                                                        id="annualReport.conferencesLatinAmericaDescription"
                                                        values={{
                                                            scratchAlSurLink: (
                                                                <a
                                                                    href="https://www.scratchalsur.org/"
                                                                    rel="noreferrer noopener"
                                                                    target="_blank"
                                                                >
                                                                    Scratch al Sur
                                                                </a>
                                                            ),
                                                            spanishVersionLink: (
                                                                <a
                                                                    href="https://scratchalsur.org/assets/computaci%c3%b3n-creativa.pdf"
                                                                    rel="noreferrer noopener"
                                                                    target="_blank"
                                                                >
                                                                    <FormattedMessage id="annualReport.conferencesSpanishVersionLinkText" />
                                                                </a>
                                                            ),
                                                            creativeComputingCurriculumLink: (
                                                                <a
                                                                    href="http://creativecomputing.gse.harvard.edu/guide/curriculum.html"
                                                                    rel="noreferrer noopener"
                                                                    target="_blank"
                                                                >
                                                                    Creative Computing Curriculum
                                                                </a>
                                                            )
                                                        }}
                                                    />
                                                    {/* eslint-enable max-len */}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="schools-conferences-region europe">
                                            <div className="conference-title-and-description left">
                                                <h4>
                                                    <FormattedMessage id="annualReport.conferencesEuropeTitle" />
                                                </h4>
                                                <p>
                                                    <FormattedMessage
                                                        id="annualReport.conferencesEuropeDescription"
                                                        values={{
                                                            scratchConferenceEuropeLink: (
                                                                <a
                                                                    href="https://www.raspberrypi.org/blog/keynote-speeches-scratch-conference-europe-2019/"
                                                                    rel="noreferrer noopener"
                                                                    target="_blank"
                                                                >
                                                                    Scratch Conference Europe
                                                                </a>
                                                            )
                                                        }}
                                                    />
                                                </p>
                                            </div>
                                            <div className="conference-image-and-caption">
                                                {/* eslint-disable-next-line max-len */}
                                                <img src="/images/annual-report/initiatives/schools/Conferences Story/Europe Conference.png" />
                                                <span className="photo-credit">
                                                    <FormattedMessage
                                                        id="annualReport.conferencesEuropeImageCaption"
                                                        values={{
                                                            photoCredit: 'Raspberry Pi'
                                                        }}
                                                    />
                                                </span>
                                            </div>
                                        </div>
                                        <div className="schools-conferences-region">
                                            <div className="conference-image-and-caption left">
                                                {/* eslint-disable-next-line max-len */}
                                                <img src="/images/annual-report/initiatives/schools/Conferences Story/Africa Conference.png" />
                                                <span className="photo-credit">
                                                    <FormattedMessage
                                                        id="annualReport.conferencesAfricaImageCaption"
                                                        values={{
                                                            photoCredit: 'Carmelo Presicce'
                                                        }}
                                                    />
                                                </span>
                                            </div>
                                            <div className="conference-title-and-description">
                                                <h4>
                                                    <FormattedMessage id="annualReport.conferencesAfricaTitle" />
                                                </h4>
                                                <p>
                                                    <FormattedMessage
                                                        id="annualReport.conferencesAfricaDescription"
                                                        values={{
                                                            scratchAfricaConferenceLink: (
                                                                <a
                                                                    href="https://www.scratchafrica.com/"
                                                                    rel="noreferrer noopener"
                                                                    target="_blank"
                                                                >
                                                                    Scratch Africa Conference
                                                                </a>
                                                            )
                                                        }}
                                                    />
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        className="financials-section"
                        ref={this.setRef(SECTIONS.financials)}
                    >
                        <div className="inner">
                            <h2 className="financials-h2">
                                <FormattedMessage id="annualReport.financialsTitle" />
                            </h2>
                            <div className="financials-future">
                                <FormattedMessage id="annualReport.financialsFutureYears" />
                            </div>
                            <div className="financials-button-wrapper">
                                <a
                                    href="/pdfs/annual-report/2019/2019_audited_financials.pdf"
                                    target="_blank"
                                >
                                    <Button className="financials-button">
                                        <FormattedMessage id="annualReport.financialsButton" />
                                        <img
                                            className="download-icon"
                                            src="/images/annual-report/financials/download-icon.svg"
                                        />
                                    </Button>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div
                        className="supporters-section"
                        ref={this.setRef(SECTIONS.supporters)}
                    >
                        <div className="inner">
                            <div className="supporters-heading">
                                <h2>
                                    <FormattedMessage id="annualReport.supportersTitle" />
                                </h2>
                                <p>
                                    <FormattedMessage id="annualReport.supportersIntro" />
                                </p>
                            </div>
                            <div className="subsection-tag">
                                <FormattedMessage id="annualReport.supportersSpotlightTitle" />
                            </div>
                            <div className="supporters-subsection">
                                <div className="supporters-blurb">
                                    <h4>
                                        <FormattedMessage id="annualReport.supportersSFETitle" />
                                    </h4>
                                    <p>
                                        <FormattedMessage id="annualReport.supportersSFEDescription1" />
                                    </p>
                                    <p>
                                        <FormattedMessage id="annualReport.supportersSFEDescription2" />
                                    </p>
                                    <p>
                                        <FormattedMessage id="annualReport.supportersSFEDescription3" />
                                    </p>
                                </div>
                            </div>
                            <div className="david-siegel">
                                <div className="ds-info">
                                    <img src="/images/annual-report/david-siegel-photo.svg" />
                                    <div className="ds-text">
                                        <h4>David Siegel</h4>
                                        <FormattedMessage id="annualReport.supportersCoFounder" />
                                        <br />Two Sigma
                                    </div>
                                </div>
                                <div className="ds-quote">
                                    {/* eslint-disable-next-line */}
                                    <Comment comment={this.props.intl.formatMessage({id: 'annualReport.supportersQuote'})} />
                                </div>
                            </div>
                            <div className="supporters-subsection supporters-lists">
                                <div className="supporters-blurb">
                                    <h4>
                                        <FormattedMessage id="annualReport.supportersThankYou" />
                                    </h4>
                                    <p>
                                        <FormattedMessage id="annualReport.supportersAllDescription" />
                                    </p>
                                    <p className="founding-partners-blurb">
                                        <FormattedMessage id="annualReport.supportersFoundingDescription" />
                                    </p>
                                </div>
                                <div className="supporters-level">
                                    <h5>
                                        <FormattedMessage id="annualReport.supportersFoundingTitle" />
                                    </h5>
                                    <hr />
                                    {createSupportersLists(Supporters.founding)}
                                </div>
                                <div className="supporters-level">
                                    <h5>
                                        <FormattedMessage id="annualReport.supportersCreativityTitle" />
                                    </h5>
                                    <hr />
                                    {createSupportersLists(Supporters.creativity)}
                                </div>
                                <div className="supporters-level">
                                    <h5>
                                        <FormattedMessage id="annualReport.supportersCollaborationTitle" />
                                    </h5>
                                    <hr />
                                    {createSupportersLists(Supporters.collaboration)}
                                </div>
                                <div className="supporters-level">
                                    <h5>
                                        <FormattedMessage id="annualReport.supportersImaginationTitle" />
                                    </h5>
                                    <hr />
                                    {createSupportersLists(Supporters.imagination)}
                                </div>
                                <div className="supporters-level">
                                    <h5>
                                        <FormattedMessage id="annualReport.supportersInspirationTitle" />
                                    </h5>
                                    <hr />
                                    {createSupportersLists(Supporters.inspiration)}
                                </div>
                                <div className="supporters-level">
                                    <h5>
                                        <FormattedMessage id="annualReport.supportersExplorationTitle" />
                                    </h5>
                                    <hr />
                                    {createSupportersLists(Supporters.exploration)}
                                </div>
                            </div>
                            <div className="supporters-subsection supporters-lists">
                                <div className="supporters-level">
                                    <h3>
                                        <FormattedMessage id="annualReport.supportersInKindTitle" />
                                    </h3>
                                    {createSupportersLists(Supporters.inKind)}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        className="leadership-section"
                        ref={this.setRef(SECTIONS.team)}
                    >
                        <div className="inner">
                            <h2>
                                <FormattedMessage id="annualReport.leadershipTitle" />
                            </h2>
                            <h3>
                                <FormattedMessage id="annualReport.leadershipBoard" />
                            </h3>
                            <FlexRow className="leadership-board">
                                <div className="board-member">
                                    <b className="board-title">
                                        <FormattedMessage id="annualReport.leadershipChair" />
                                    </b>
                                    <h4>Mitch Resnick</h4>
                                    <FormattedMessage id="annualReport.leadershipProfessor" />
                                    <br />MIT Media Lab
                                </div>
                                <div className="board-member">
                                    <b className="board-title">
                                        <FormattedMessage id="annualReport.leadershipViceChair" />
                                    </b>
                                    <h4>David Siegel</h4>
                                    <FormattedMessage id="annualReport.supportersCoFounder" />
                                    <br />Two Sigma
                                </div>
                                <div className="board-member">
                                    <b className="board-title">
                                        <FormattedMessage id="annualReport.leadershipBoardMember" />
                                    </b>
                                    <h4>Ursula Burns</h4>
                                    <FormattedMessage id="annualReport.leadershipFormerChairCEO" />
                                    <br />Xerox
                                </div>
                                <div className="board-member">
                                    <b className="board-title">
                                        <FormattedMessage id="annualReport.leadershipBoardMember" />
                                    </b>
                                    <h4>Margaret Honey</h4>
                                    <FormattedMessage id="annualReport.leadershipPresidentCEO" />
                                    <br />New York Hall of Science
                                </div>
                                <div className="board-member">
                                    <b className="board-title">
                                        <FormattedMessage id="annualReport.leadershipBoardMember" />
                                    </b>
                                    <h4>Avraham Kadar</h4>
                                    <FormattedMessage id="annualReport.leadershipFounderCEO" />
                                    <br />BrainPOP
                                </div>
                                <div className="board-member">
                                    <b className="board-title">
                                        <FormattedMessage id="annualReport.leadershipBoardMember" />
                                    </b>
                                    <h4>Christina Miller</h4>
                                    <FormattedMessage id="annualReport.leadershipFormerPresident" />
                                    <br />Cartoon Network
                                </div>
                            </FlexRow>
                            <h4>
                                <FormattedMessage id="annualReport.leadershipBoardSecretaryTreasurer" />
                            </h4>
                            <FlexRow className="leadership-board">
                                <div className="board-member">
                                    <b className="board-title">
                                        <FormattedMessage id="annualReport.leadershipBoardSecretary" />
                                    </b>
                                    <h4>Sheri Vammen</h4>
                                </div>
                                <div className="board-member">
                                    <b className="board-title">
                                        <FormattedMessage id="annualReport.leadershipBoardTreasurer" />
                                    </b>
                                    <h4>Rich Sauer</h4>
                                </div>
                            </FlexRow>
                            <div className="leadership-scratch-team">
                                <h3>
                                    <FormattedMessage id="annualReport.leadershipScratchTeam" />
                                </h3>
                                <div className="executive-director">
                                    <PeopleGrid
                                        linkToNewTab
                                        people={[{
                                            userName: 'Champ99',
                                            userId: 900283,
                                            name: 'Champika'
                                        }]}
                                    />
                                    <FormattedMessage id="annualReport.leadershipInterim" />
                                </div>
                                <PeopleGrid
                                    linkToNewTab
                                    people={People}
                                />
                            </div>
                        </div>
                    </div>
                    <div
                        className="donate-section"
                        ref={this.setRef(SECTIONS.donate)}
                    >
                        <FlexRow className="donate-info">
                            <MediaQuery minWidth={frameless.tabletPortrait}>
                                <img src="/images/annual-report/donate-illustration.svg" />
                            </MediaQuery>
                            <div className="donate-content">
                                <h2>
                                    <FormattedMessage id="annualReport.donateTitle" />
                                </h2>
                                <p>
                                    <FormattedMessage id="annualReport.donateMessage" />
                                </p>
                                <a
                                    href="https://secure.donationpay.org/scratchfoundation/"
                                    rel="noreferrer noopener"
                                    target="_blank"
                                >
                                    <Button className="donate-button">
                                        <FormattedMessage id="annualReport.donateButton" />
                                    </Button>
                                </a>
                            </div>
                        </FlexRow>
                    </div>
                </div>
            </div>
        );
    }
}

AnnualReport.propTypes = {
    intl: intlShape
};

const WrappedAnnualReport = injectIntl(AnnualReport);

render(
    <Page><WrappedAnnualReport /></Page>, document.getElementById('app')
);
