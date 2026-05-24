import { App, PluginSettingTab, Setting } from "obsidian";
import BattleTrackerPlugin from "./main";
import { BattleTrackerSettings } from "./types";
import { LOCALIZATION } from "./localization";
import { VIEW_TYPE, BattleTrackerView } from "./view";

export const DEFAULT_SETTINGS: BattleTrackerSettings = {
	language: "es",
	fields: {
		initiative: "initiative",
		hp: "hp",
		hp_max: "hp_max",
		ac: "ac",
		type: "type",
		extra_fields: "mp,stamina",
	},
	conditions: "Aturdido,Envenenado,Paralizado,Asustado,Invisible,Concentración,Maldito,Quemando,Caído,Cegado",
	combatantFolder: "",
	logEnabled: true,
	logMode: "ask",
	logHeader: "## Registro de Combate",
	logFileName: "Registro de Combate {date}",
	logFolder: "",
};

export class BattleTrackerSettingTab extends PluginSettingTab {
	plugin: BattleTrackerPlugin;

	constructor(app: App, plugin: BattleTrackerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display() {
		const { containerEl } = this;
		containerEl.empty();

		const lang = this.plugin.settings.language;
		const t = LOCALIZATION[lang];

		containerEl.createEl("h2", { text: t.settingsTitle });

		// Language Setting
		new Setting(containerEl)
			.setName(t.settingsLanguageName)
			.setDesc(t.settingsLanguageDesc)
			.addDropdown((dropdown) =>
				dropdown
					.addOption("es", "Español")
					.addOption("en", "English")
					.setValue(this.plugin.settings.language)
					.onChange(async (value: "es" | "en") => {
						const oldLang = this.plugin.settings.language;
						if (oldLang === value) return;

						// Automatically switch defaults if they were unchanged
						const parseConds = (str: string) => str.split(",").map(s => s.trim()).filter(Boolean).join(",");

						const esCondDefaults = "Aturdido,Envenenado,Paralizado,Asustado,Invisible,Concentración,Maldito,Quemando,Caído,Cegado";
						const enCondDefaults = "Stunned,Poisoned,Paralyzed,Frightened,Invisible,Concentration,Cursed,Burning,Prone,Blinded";

						const currentCondsParsed = parseConds(this.plugin.settings.conditions);
						if (currentCondsParsed === parseConds(esCondDefaults) || currentCondsParsed === parseConds(enCondDefaults)) {
							this.plugin.settings.conditions = value === "es" ? esCondDefaults : enCondDefaults;
						}

						const esHeader = "## Registro de Combate";
						const enHeader = "## Combat Log";
						if (this.plugin.settings.logHeader === esHeader || this.plugin.settings.logHeader === enHeader) {
							this.plugin.settings.logHeader = value === "es" ? esHeader : enHeader;
						}

						const esFile = "Registro de Combate {date}";
						const enFile = "Combat Log {date}";
						if (this.plugin.settings.logFileName === esFile || this.plugin.settings.logFileName === enFile) {
							this.plugin.settings.logFileName = value === "es" ? esFile : enFile;
						}

						this.plugin.settings.language = value;
						await this.plugin.saveSettings();

						// Re-render setting tab
						this.display();

						// Re-render view
						const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE);
						leaves.forEach((leaf) => {
							if (leaf.view instanceof BattleTrackerView) {
								leaf.view.render();
							}
						});
					})
			);

		containerEl.createEl("h3", { text: t.settingsFieldsTitle });
		containerEl.createEl("p", { text: t.settingsFieldsDesc, cls: "setting-item-description" });

		const f = this.plugin.settings.fields;

		new Setting(containerEl)
			.setName(t.settingsInitName)
			.setDesc(t.settingsInitDesc)
			.addText((text) => text.setValue(f.initiative).onChange(async (v) => { f.initiative = v; await this.plugin.saveSettings(); }));
			
		new Setting(containerEl)
			.setName(t.settingsHpName)
			.setDesc(t.settingsHpDesc)
			.addText((text) => text.setValue(f.hp).onChange(async (v) => { f.hp = v; await this.plugin.saveSettings(); }));
			
		new Setting(containerEl)
			.setName(t.settingsHpMaxName)
			.setDesc(t.settingsHpMaxDesc)
			.addText((text) => text.setValue(f.hp_max).onChange(async (v) => { f.hp_max = v; await this.plugin.saveSettings(); }));
			
		new Setting(containerEl)
			.setName(t.settingsAcName)
			.setDesc(t.settingsAcDesc)
			.addText((text) => text.setValue(f.ac).onChange(async (v) => { f.ac = v; await this.plugin.saveSettings(); }));
			
		new Setting(containerEl)
			.setName(t.settingsTypeName)
			.setDesc(t.settingsTypeDesc)
			.addText((text) => text.setValue(f.type).onChange(async (v) => { f.type = v; await this.plugin.saveSettings(); }));
			
		new Setting(containerEl)
			.setName(t.settingsExtraName)
			.setDesc(t.settingsExtraDesc)
			.addText((text) => text.setValue(f.extra_fields).onChange(async (v) => { f.extra_fields = v; await this.plugin.saveSettings(); }));

		containerEl.createEl("h3", { text: t.settingsCondTitle });
		new Setting(containerEl)
			.setName(t.settingsCondName)
			.setDesc(t.settingsCondDesc)
			.addTextArea((text) => {
				text.setValue(this.plugin.settings.conditions).onChange(async (v) => {
					this.plugin.settings.conditions = v;
					await this.plugin.saveSettings();
				});
				text.inputEl.rows = 3;
			});

		containerEl.createEl("h3", { text: t.settingsFolderTitle });
		new Setting(containerEl)
			.setName(t.settingsFolderFieldName)
			.setDesc(t.settingsFolderFieldDesc)
			.addText((text) =>
				text
					.setPlaceholder("Campaña/Criaturas")
					.setValue(this.plugin.settings.combatantFolder)
					.onChange(async (v) => {
						this.plugin.settings.combatantFolder = v;
						await this.plugin.saveSettings();
					})
			);

		// Logging Section in Settings
		containerEl.createEl("h3", { text: t.logTitle });
		
		new Setting(containerEl)
			.setName(t.logEnabledName)
			.setDesc(t.logEnabledDesc)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.logEnabled)
					.onChange(async (v) => {
						this.plugin.settings.logEnabled = v;
						await this.plugin.saveSettings();
						this.display();
					})
			);
			
		if (this.plugin.settings.logEnabled) {
			new Setting(containerEl)
				.setName(t.logHeaderName)
				.setDesc(t.logHeaderDesc)
				.addText((text) =>
					text
						.setPlaceholder(t.logHeaderPlaceholder)
						.setValue(this.plugin.settings.logHeader)
						.onChange(async (v) => {
							this.plugin.settings.logHeader = v;
							await this.plugin.saveSettings();
						})
				);

			new Setting(containerEl)
				.setName(t.logFileNameName)
				.setDesc(t.logFileNameDesc)
				.addText((text) =>
					text
						.setValue(this.plugin.settings.logFileName)
						.onChange(async (v) => {
							this.plugin.settings.logFileName = v;
							await this.plugin.saveSettings();
						})
				);

			new Setting(containerEl)
				.setName(lang === "es" ? "Carpeta de notas de registro" : "Folder for log notes")
				.setDesc(lang === "es" ? "Ruta de la carpeta donde se crearán las nuevas notas de registro (ej. Logs). Déjalo vacío para el directorio raíz." : "Path of the folder where new log notes will be created (e.g. Logs). Leave empty for root.")
				.addText((text) =>
					text
						.setPlaceholder("Logs")
						.setValue(this.plugin.settings.logFolder)
						.onChange(async (v) => {
							this.plugin.settings.logFolder = v;
							await this.plugin.saveSettings();
						})
				);
		}
	}
}
