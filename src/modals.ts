import { App, Modal, Notice, TFile } from "obsidian";
import BattleTrackerPlugin from "./main";
import { BattleTrackerView } from "./view";
import { LOCALIZATION } from "./localization";

export class DmgModal extends Modal {
	name: string;
	plugin: BattleTrackerPlugin;
	onConfirm: (val: number, heal: boolean) => void;

	constructor(app: App, name: string, plugin: BattleTrackerPlugin, onConfirm: (val: number, heal: boolean) => void) {
		super(app);
		this.name = name;
		this.plugin = plugin;
		this.onConfirm = onConfirm;
	}

	onOpen() {
		const { contentEl } = this;
		const lang = this.plugin.settings.language;
		const t = LOCALIZATION[lang];

		contentEl.createEl("h3", { text: `${t.dmgModalTitle} — ${this.name}` });
		const wrap = contentEl.createDiv("bt-modal-content");
		const input = wrap.createEl("input", { type: "number", placeholder: t.dmgModalQty });
		input.min = "0";
		const row = wrap.createDiv("bt-modal-actions");
		const healBtn = row.createEl("button", { cls: "bt-btn", text: t.dmgModalHeal });
		healBtn.onclick = () => { this.onConfirm(parseInt(input.value) || 0, true); this.close(); };
		const dmgBtn = row.createEl("button", { cls: "bt-btn bt-btn-danger-soft", text: t.dmgModalDmg });
		dmgBtn.onclick = () => { this.onConfirm(parseInt(input.value) || 0, false); this.close(); };
		setTimeout(() => input.focus(), 50);
	}

	onClose() { this.contentEl.empty(); }
}

export class ConditionModal extends Modal {
	allConditions: string[];
	current: string[];
	plugin: BattleTrackerPlugin;
	onConfirm: (updated: string[]) => void;

	constructor(app: App, all: string[], current: string[], plugin: BattleTrackerPlugin, onConfirm: (u: string[]) => void) {
		super(app);
		this.allConditions = all;
		this.current = [...current];
		this.plugin = plugin;
		this.onConfirm = onConfirm;
	}

	onOpen() {
		const { contentEl } = this;
		const lang = this.plugin.settings.language;
		const t = LOCALIZATION[lang];

		contentEl.createEl("h3", { text: t.condModalTitle });
		const grid = contentEl.createDiv("bt-cond-grid");
		this.allConditions.forEach((cond) => {
			const btn = grid.createEl("button", {
				cls: `bt-cond-toggle${this.current.includes(cond) ? " selected" : ""}`,
				text: cond,
			});
			btn.onclick = () => {
				const idx = this.current.indexOf(cond);
				if (idx >= 0) this.current.splice(idx, 1);
				else this.current.push(cond);
				btn.classList.toggle("selected");
			};
		});
		const row = contentEl.createDiv("bt-modal-actions");
		const ok = row.createEl("button", { cls: "bt-btn bt-btn-primary", text: t.condModalApply });
		ok.onclick = () => { this.onConfirm(this.current); this.close(); };
	}

	onClose() { this.contentEl.empty(); }
}

export class NoteModal extends Modal {
	current: string;
	plugin: BattleTrackerPlugin;
	onConfirm: (txt: string) => void;

	constructor(app: App, current: string, plugin: BattleTrackerPlugin, onConfirm: (txt: string) => void) {
		super(app);
		this.current = current;
		this.plugin = plugin;
		this.onConfirm = onConfirm;
	}

	onOpen() {
		const { contentEl } = this;
		const lang = this.plugin.settings.language;
		const t = LOCALIZATION[lang];

		contentEl.createEl("h3", { text: t.noteModalTitle });
		const wrap = contentEl.createDiv("bt-modal-content");
		const ta = wrap.createEl("textarea", { placeholder: t.noteModalPlaceholder });
		ta.value = this.current;
		const row = wrap.createDiv("bt-modal-actions");
		const ok = row.createEl("button", { cls: "bt-btn bt-btn-primary", text: t.noteModalSave });
		ok.onclick = () => { this.onConfirm(ta.value); this.close(); };
		setTimeout(() => ta.focus(), 50);
	}

	onClose() { this.contentEl.empty(); }
}

export class PickCombatantsModal extends Modal {
	plugin: BattleTrackerPlugin;
	onConfirm: (files: TFile[]) => void;
	selected: Set<string> = new Set();

	constructor(app: App, plugin: BattleTrackerPlugin, onConfirm: (files: TFile[]) => void) {
		super(app);
		this.plugin = plugin;
		this.onConfirm = onConfirm;
	}

	onOpen() {
		const { contentEl } = this;
		const lang = this.plugin.settings.language;
		const t = LOCALIZATION[lang];

		contentEl.createEl("h3", { text: t.pickModalTitle });

		const searchInput = contentEl.createEl("input", {
			type: "text",
			placeholder: t.pickModalSearch,
			cls: "bt-modal-content",
		});
		searchInput.style.marginBottom = "8px";

		const list = contentEl.createDiv("bt-pick-list");

		const files = this.app.vault.getMarkdownFiles().sort((a, b) => a.basename.localeCompare(b.basename));

		const renderList = (filter: string) => {
			list.empty();
			files
				.filter((f) => !filter || f.basename.toLowerCase().includes(filter.toLowerCase()))
				.forEach((file) => {
					const item = list.createDiv("bt-pick-item");
					const cb = item.createEl("input", { type: "checkbox" }) as HTMLInputElement;
					cb.checked = this.selected.has(file.path);
					cb.onchange = () => {
						if (cb.checked) this.selected.add(file.path);
						else this.selected.delete(file.path);
					};
					const lbl = item.createEl("label", { text: file.basename });
					lbl.onclick = () => { cb.checked = !cb.checked; cb.dispatchEvent(new Event("change")); };
				});
		};

		renderList("");
		searchInput.oninput = () => renderList(searchInput.value);

		const row = contentEl.createDiv("bt-modal-actions");
		const cancel = row.createEl("button", { cls: "bt-btn", text: t.pickModalCancel });
		cancel.onclick = () => this.close();
		const ok = row.createEl("button", { cls: "bt-btn bt-btn-primary", text: t.pickModalLoad });
		ok.onclick = () => {
			const picked = files.filter((f) => this.selected.has(f.path));
			if (!picked.length) { new Notice(t.pickModalSelectMin); return; }
			this.onConfirm(picked);
			this.close();
		};

		setTimeout(() => searchInput.focus(), 50);
	}

	onClose() { this.contentEl.empty(); }
}

export class LogSetupModal extends Modal {
	plugin: BattleTrackerPlugin;
	view: BattleTrackerView;
	onChoose: (file: TFile | null) => void;

	constructor(app: App, plugin: BattleTrackerPlugin, view: BattleTrackerView, onChoose: (file: TFile | null) => void) {
		super(app);
		this.plugin = plugin;
		this.view = view;
		this.onChoose = onChoose;
	}

	onOpen() {
		const { contentEl } = this;
		const lang = this.plugin.settings.language;
		const t = LOCALIZATION[lang];

		contentEl.createEl("h3", { text: t.logConfigureTitle });
		contentEl.createEl("p", { text: t.logHeadingDesc, cls: "setting-item-description" });

		// Actions container
		const container = contentEl.createDiv("bt-modal-content");

		// Button to create a new file
		const newFileBtn = container.createEl("button", { cls: "bt-btn bt-btn-primary", text: `📝 ${t.logCreateNewFile}` });
		newFileBtn.style.width = "100%";
		newFileBtn.style.padding = "8px";
		newFileBtn.style.marginBottom = "15px";
		newFileBtn.onclick = async () => {
			try {
				const file = await this.view.createNewLogFile();
				new Notice(`${t.logActiveLogFile}: ${file.name}`);
				this.onChoose(file);
				this.close();
			} catch (e) {
				new Notice(lang === "es" ? "Error al crear la nota de registro." : "Error creating log note.");
				console.error(e);
			}
		};

		// Divider
		const divider = container.createDiv();
		divider.style.textAlign = "center";
		divider.style.margin = "10px 0";
		divider.style.color = "var(--text-muted)";
		divider.style.fontSize = "11px";
		divider.setText("─── " + (lang === "es" ? "O SELECCIONAR EXISTENTE" : "OR SELECT EXISTING") + " ───");

		// File selector
		const searchInput = container.createEl("input", {
			type: "text",
			placeholder: t.pickModalSearch,
		});
		searchInput.style.marginBottom = "8px";

		const list = container.createDiv("bt-pick-list");
		list.style.maxHeight = "180px";

		const files = this.app.vault.getMarkdownFiles().sort((a, b) => a.basename.localeCompare(b.basename));

		const renderList = (filter: string) => {
			list.empty();
			files
				.filter((f) => !filter || f.basename.toLowerCase().includes(filter.toLowerCase()))
				.slice(0, 50) // Limit display for performance
				.forEach((file) => {
					const item = list.createDiv("bt-pick-item");
					item.style.padding = "6px 8px";
					item.setText(file.path);
					item.onclick = () => {
						new Notice(`${t.logActiveLogFile}: ${file.name}`);
						this.onChoose(file);
						this.close();
					};
				});
		};

		renderList("");
		searchInput.oninput = () => renderList(searchInput.value);

		// Modal footer actions
		const row = contentEl.createDiv("bt-modal-actions");
		row.style.marginTop = "15px";
		
		const cancelBtn = row.createEl("button", { cls: "bt-btn", text: t.logButtonNoLog });
		cancelBtn.onclick = () => {
			this.onChoose(null);
			this.close();
		};
	}

	onClose() {
		this.contentEl.empty();
	}
}
