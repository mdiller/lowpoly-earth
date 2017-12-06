import React from 'react';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem'

const ConfigSelect = ({config_item, config}) => {
	return (
		<SelectField 
			id={`config_item_${config_item.name}`}
			value={config[config_item.name]}
			label={config_item.label}
			onChange={(event, index, value) => { config[config_item.name] = value; }}>
			{config_item.options.map(option => 
				<MenuItem key={option.name} value={option.name} primaryText={option.localized} />
			)}
		</SelectField>
	);
};

export default ConfigSelect;
