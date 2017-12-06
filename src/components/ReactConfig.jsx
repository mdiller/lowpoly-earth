import React from 'react';
import ReactDOM from 'react-dom';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import ConfigSelect from './ConfigSelect.jsx';

const ConfigContent = (config_items, config) => {
	return (
		<MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
			<div>
				<ConfigSelect config_item={config_items[4]} config={config} />
			</div>
		</MuiThemeProvider>
	);
};

export default function ReactConfig(config_items, config) {
	ReactDOM.render(
		ConfigContent(config_items, config),
		document.getElementById("config-content")
	);
};

