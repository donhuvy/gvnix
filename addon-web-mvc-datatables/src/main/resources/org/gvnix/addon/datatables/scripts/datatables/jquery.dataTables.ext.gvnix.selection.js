/*
 * gvNIX. Spring Roo based RAD tool for Generalitat Valenciana Copyright (C)
 * 2013 Generalitat Valenciana
 * 
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later
 * version.
 * 
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
 * details.
 * 
 * You should have received a copy of the GNU General Public License along with
 * this program. If not, see &lt;http://www.gnu.org/copyleft/gpl.html&gt;.
 */

/* Global scope for GvNIX_Selection */
var GvNIX_Selection;

(function($, window, document) {

	GvNIX_Selection = function(oSettings, oOpts) {
		/* Santiy check that we are a new instance */
		if (!this instanceof GvNIX_Selection) {
			alert("Warning: GvNIX_Selection must be initialised with the keyword 'new'");
		}

		/***********************************************************************
		 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		 * Public class variables * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		 */

		/**
		 * @namespace Settings object which contains customisable information
		 *            for TableTools instance
		 */
		this.s = {

			/**
			 * Allow multiple row selection
			 * 
			 * @property multiRow
			 * @type boolean
			 * @default false
			 */
			"multiRow" : false,

			/**
			 * Show messages on console
			 * 
			 * @property debug
			 * @type boolean
			 * @default false
			 */
			"debug" : false,

			/**
			 * Css class of checkbox to manage selection
			 * 
			 * @property checkColumnClass
			 * @type string
			 * @default null
			 */
			"checkColumnClass" : null,

			/**
			 * Css class to set
			 * <tr> on selected rows
			 * 
			 * @property classForSelectedRow
			 * @type string
			 * @default 'row_selected'
			 */
			"classForSelectedRow" : 'row_selected',

			/**
			 * Css class to set
			 * <tr> on not-selected rows
			 * 
			 * @property classForNotSelectedRow
			 * @type string
			 * @default null
			 */
			"classForNotSelectedRow" : null,

			/**
			 * Show a information message on datatables info label. Ex: '<br/>
			 * Selected _SEL-COUNT_ rows, _SEL-VISIBLE-COUNT_ on this page'
			 * 
			 * @property _infoMessage
			 * @type string
			 * @default null
			 */
			"infoMessage" : null,

		};

		/**
		 * @namespace Settings object which contains customisable information
		 *            for TableTools instance
		 */
		this._data = {

			/**
			 * Store 'this' so the instance can be retrieved from the settings
			 * object
			 * 
			 * @property that
			 * @type object
			 * @default this
			 */
			"that" : this,

			/**
			 * DataTables settings objects
			 * 
			 * @property dt
			 * @type object
			 * @default <i>From the oDT init option</i>
			 */
			"dt" : oSettings,

			/**
			 * save user-defined fnInfoCallBack before replace it for set
			 * infoMessage.
			 * 
			 * @property classForNotSelectedRow
			 * @type function
			 * @default null
			 */
			"user_fnInfoCallBack" : null,

			/**
			 * List of ids. This list could be selected or not-selected ids
			 * depending on idListSelected value.
			 * 
			 * @property idList
			 * @type array
			 * @default []
			 */
			"idList" : null,
			/**
			 * Informs if items from _idList are selected (true) or not-selected
			 * (false) idListSelected value.
			 * 
			 * @property idListSelected
			 * @type boolean
			 * @default true
			 */
			"idListSelected" : true,

			/**
			 * Flag to mark all-items-selected.
			 * 
			 * @property selectedAll
			 * @type boolean
			 * @default false
			 */
			"selectedAll" : false,
		};

		/***********************************************************************
		 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		 * Public class methods * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		 */

		/**
		 * Retreieve the settings object from an instance
		 * 
		 * @method fnSettings
		 * @returns {object} TableTools settings object
		 */
		this.fnSettings = function() {
			return this.s;
		};

		/* Constructor logic */
		this._fnConstruct(oOpts);
		
		GvNIX_Selection._aInstances.push( this );

		return this;
	};

	GvNIX_Selection.prototype = {

		/***********************************************************************
		 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		 * Public methods * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		 */

		/**
		 * Try to show a message on browser JS console
		 * 
		 * @param message
		 *            to show
		 */
		"log" : function(message) {
			try {
				console.log(message);
			} catch (e) {
				// Can't do anything
			}
		},

		/**
		 * Gets the row (node) from its id
		 * 
		 * @param id
		 *            value
		 */
		"fnGetRowById" : function(trId) {
			var aoData = this._data.dt.aoData;
			for ( var i = 0; i < aoData.length; i++) {
				var nRow = aoData[i].nTr;
				if (nRow.id == trId) {
					return nRow;
				}
			}
			return null;
		},

		/**
		 * Redraw a row
		 * 
		 * @param trId
		 *            tr.id value (could be DT_RowId on AJAX mode)
		 * @param isSelected
		 *            (optional if not set it will check)
		 */
		"fnRedrawRow" : function(trId, isSelected) {
			if (isSelected === undefined) {
				isSelected = this.fnIsSelected(trId);
			}
			var nRow = this.fnGetRowById(trId);
			// Check if row is loaded
			if (nRow){
				this._fnUpdateRowTr(nRow, isSelected);
			}
		},

		/**
		 * Redraw all visible rows
		 * 
		 * @param trId
		 *            tr.id value (could be DT_RowId on AJAX mode)
		 * @param isSelected
		 *            (optional if not set it will check)
		 */
		"fnRedrawVisibleRows" : function() {

			var dt = this._data.dt;
			var aoData = dt.aoData, aiDisplay = dt.aiDisplay,
			start = 0, end = aiDisplay.length;
			
			if (!dt.oFeatures.bServerSide) {
				start = dt._iDisplayStart;
				end = dt.fnDisplayEnd();
			}

			for ( var i = start; i < end; i++) {
				var nRow = aoData[aiDisplay[i]].nTr;
				this._fnUpdateRowTr(nRow, this.fnIsSelected(nRow.id));
			}
		},

		/**
		 * Informs how many rows are selected and visible
		 */
		"fnVisibleRowsSelecteds" : function() {
			var dt = this._data.dt, count = 0;
			var aoData = dt.aoData, aiDisplay = dt.aiDisplay,
			start = 0, end = aiDisplay.length;
			
			if (!dt.oFeatures.bServerSide) {
				start = dt._iDisplayStart;
				end = dt.fnDisplayEnd();
			}

			for ( var i = start; i < end; i++) {
				var nRow = aoData[aiDisplay[i]].nTr;
				if (this.fnIsSelected(nRow.id)) {
					count++;
				}
			}
			return count;
		},

		/**
		 * Informs if trId is selected
		 * 
		 * @param trId
		 *            tr.id value (could be DT_RowId on AJAX mode)
		 */
		"fnIsSelected" : function(trId) {
			var _d = this._data;

			if (_d.selectedAll) {
				return true;
			}
			return this._fnIdInList(trId) ? _d.idListSelected
					: !_d.idListSelected;
		},

		/**
		 * Toggle trId selection status
		 * 
		 * @param trId
		 *            tr.id value (could be DT_RowId on AJAX mode)
		 */
		"fnToggleSelect" : function(trId) {
			var debug = this.s.debug;
			if (this.fnIsSelected(trId)) {
				if (debug) {
					this.log("fnToggleSelect: " + trId + " --> deselected");
				}
				this.fnDeselect(trId);
			} else {
				if (debug) {
					this.log("fnToggleSelect: " + trId + " --> selected");
				}
				this.fnSelect(trId);
			}
		},

		/**
		 * Get selection count
		 * 
		 * @returns numero of row selected
		 */
		"fnSelectionCount" : function() {
			var _d = this._data, totalRecords = _d.dt.fnRecordsTotal();

			if (_d.selectedAll) {
				return totalRecords;
			}
			var idLength = _d.idList.length;
			return _d.idListSelected ? idLength : totalRecords - idLength;
		},

		/**
		 * Get if there is at least one row selected
		 * 
		 * @returns true if there is any row selected
		 */
		"fnHasSeletion" : function() {
			var _d = this._data, dt = _d.dt;
			if (_d.selectedAll) {
				return true;
			}
			var listLength = _d.idList.length;
			return _d.idListSelected ? listLength > 0
					: (dt.fnRecordsTotal() - listLength) > 0;
		},
		
		/**
		 * Gets an array of all selected ids
		 * 
		 * WARNING: not supported if bServerSide datatables is set. See fnGetSelectionInfo.
		 * 
		 * @returns an array of selecte id.
		 */
		"fnGetSelectedIds" : function() {
			var _d = this._data, dt = _d.dt;
			if (dt.oFeatures.bServerSide) {
				log("fnGetSelectedIds: method not supported in bServerSide datatable mode");
				throw "fnGetSelectedIds: method not supported in bServerSide datatable mode";
			}
			var aoData = dt.aoData, result = [];
			if (_d.selectedAll) {
				for ( var i = 0; i < aoData.length; i++) {
					var nRow = aoData[i].nTr;
					result.push(nRow.id);
				}
			} else if (_d.idListSelected) {
				result = _d.idList.slice();
				
			} else {
				for ( var i = 0; i < aoData.length; i++) {
					var id = aoData[i].nTr.id;
					if (!this._fnIdInList(id)){
						result.push(id);
					}	
				}
			}
			return result;
		},
		
		/**
		 * Gets an array of all selected ids visibles in current page
		 * 
		 * @returns an array of selecte id or null if all registers
		 * are selected.
		 */
		"fnGetVisibleSelectedIds" : function() {
			var _d = this._data, dt = _d.dt;
			var aoData = dt.aoData, aiDisplay = dt.aiDisplay,
			start = 0, end = aiDisplay.length,
			result = [];
			
			if (!dt.oFeatures.bServerSide) {
				start = dt._iDisplayStart;
				end = dt.fnDisplayEnd();
			}

			for ( var i = start; i < end; i++) {
				var nRow = aoData[aiDisplay[i]].nTr;
				if (this.fnIsSelected(nRow.id)) {
					result.push(id);
				}
			}
			return result;
		},
		
		/**
		 * Return an Object with selection information:
		 * <ul>
		 * <li><code>idList</code>(array of objects): List of refered ide</li>
		 * <li><code>idListSelected</code>(boolean) if true 
		 * 		<code>idList</code> contains <em>selected</em> id, otherwise <code>idList</code> contains <em>not-selected</em> ids</li>
		 * <li><code>all</code>(boolean): if true all elements all selected (previous values are empty)</li>
		 * </ul>
		 */
		"fnGetSelectionInfo": function () {
			var _d = this._data;
			if (_d.selectedAll){
				return {"all": true, "idList": new Array(), "idListSelected": false};
			} else {
				return {"all": false, "idList": _d.idList.slice(), "idListSelected": _d.idListSelected};
			}
		},

		/**
		 * Set trId as selected
		 * 
		 * @param trId
		 *            tr.id value (could be DT_RowId on AJAX mode)
		 * @param redraw
		 *            row if change state
		 * @returns true if selection has been change
		 */
		"fnSelect" : function(trId, redraw) {
			var _d = this._data, s = this.s;

			if (_d.selectedAll) {
				// Already selected
				return false;
			}
			var changed = false;
			var index = jQuery.inArray(trId, _d.idList);
			if (index === -1) {
				// not in list
				if (_d.idListSelected) {
					// before add, check for multi options
					if (!s.multiRow) {
						// check for previso selection
						var count = this.fnSelectionCount();
						if (count > 1) {
							this.fnSelectNone(redraw, false);
						} else if (count == 1) {
							// TODO add info param
							this.fnDeselect(_d.idList[0], redraw);
						}
					}
					// add to "selected" list
					_d.idList.push(trId);
					changed = true;
				}
			} else {
				// in list
				if (!_d.idListSelected) {
					// before add, check for multi options
					if (!s.multiRow) {
						// check for previso selection
						if (this.fnHasSeletion()) {
							this.fnSelectNone(redraw, false);
						}
					}
					// remove from "not-selected" list
					_d.idList.splice(index, 1);
					changed = true;
				}
			}
			if (redraw === undefined || redraw) {
				this.fnRedrawRow(trId, true);
				this._fnUpdateInfo();
			}
			return changed;
		},

		/**
		 * Set trId as no-selected
		 * 
		 * @param trId
		 *            tr.id value (could be DT_RowId on AJAX mode)
		 * @param redraw
		 *            row if change state
		 * @returns true if selection has been change
		 */
		"fnDeselect" : function(trId, redraw) {
			var _d = this._data;
			if (_d.selectedAll) {
				// Toggle select all and use id list as not-selected
				_d.selectedAll = false;
				_d.idListSelected = false;
				_d.idList = [ trId ];
				if (redraw === undefined || redraw) {
					this.fnRedrawRow(trId);
					this._fnUpdateInfo();
				}
				return true;
			}
			var changed = false;
			var index = jQuery.inArray(trId, _d.idList);
			if (index === -1) {
				// not in list
				if (!_d.idListSelected) {
					// add to "not-selected" list
					_d.idList.push(trId);
				}
				if (this.fnSelectionCount() == 0){
					_d.idList = [];
					_d.idListSelected = true;
				}
			} else {
				// in list
				if (_d.idListSelected) {
					// remove from "selected" referred list
					_d.idList.splice(index, 1);
				}
			}
			if (redraw === undefined || redraw) {
				this.fnRedrawRow(trId);
				this._fnUpdateInfo();
			}
			return changed;
		},

		/**
		 * Set all rows as selected
		 * 
		 * @param redraw
		 *            row if change state
		 * @returns true if selection has been change
		 */
		"fnSelectAll" : function(redraw) {
			var _d = this._data;
			if (_d.selectedAll) {
				return false;
			}
			_d.selectedAll = true;
			_d.idListSelected = true;
			_d.idList = [];
			if (redraw === undefined || redraw) {
				this.fnRedrawVisibleRows();
				this._fnUpdateInfo();
			}
			return true;
		},

		/**
		 * Set all rows as no-selected
		 * 
		 * @param redraw
		 *            row if change state
		 * @param updateInfo
		 *            if redraw
		 * @returns true if selection has been change
		 */
		"fnSelectNone" : function(redraw, updateInfo) {
			var _d = this._data;
			if (!_d.selectedAll) {
				if (_d.idList.length == 0) {
					return false;
				}
			}
			_d.selectedAll = false;
			_d.idListSelected = true;
			_d.idList = [];
			if (redraw === undefined || redraw) {
				this.fnRedrawVisibleRows();
				if (updateInfo === undefined || updateInfo) {
					this._fnUpdateInfo();
				}
			}
			return true;
		},

		/***********************************************************************
		 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		 * Private methods (they are of course public in JS, but recommended as
		 * private) * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		 */

		/**
		 * Informs if trId is selected
		 * 
		 * @param trId
		 *            tr.id value (could be DT_RowId on AJAX mode)
		 */
		"_fnIdInList" : function(trId) {
			return jQuery.inArray(trId, this._data.idList) !== -1;
		},

		/**
		 * Register a Datatables fnRowDrawCallback
		 * 
		 * This registers a function on datatable to draw row.
		 * 
		 * Also bind click event on row to manage selection.
		 */
		"_fnRegisterDrawSelectionRowCallback" : function() {

			var that = this, dt = this._data.dt;

			dt.oApi._fnCallbackReg(dt, 'aoRowCallback', function(
					nRow, aData, iDisplayIndex) {
				// Locate Id
				var rowId = nRow.id;
				if (!rowId) {
					// Check for DT_RowId in data
					rowId = aData.DT_RowId;
				}
				if (!rowId) {
					throw "Can't get Row id for manage selection!!";
				}
				// update row stile
				that._fnUpdateRowTr(nRow, that.fnIsSelected(rowId));
				// Check if it's already bind click event
				that._fnBindClickEvent(nRow);
			}, 'addSelectionSupport');
		},

		/**
		 * Datatables fnInfoCallback
		 * 
		 * This funtion will register a callback on datatables to draw the table
		 * to add 'infoMessage' to datatable info label.
		 * 
		 * This concatenate to the end of 'sPre' (message generated by
		 * datatables or custom user function) the value of 'infoMessage' after
		 * replacing '_SEL-VISIBLE-COUNT_' and '_SEL-COUNT_' variables.
		 */
		"_fnRegisterSelectionInfoCallback" : function() {

			var that = this, dt = this._data.dt;

			if (!this.s.infoMessage) {
				return;
			}
			if (dt.oLanguage.fnInfoCallback !== null) {
				this._data.user_fnInfoCallBack = dt.oLanguage.fnInfoCallback;
			}

			dt.oLanguage.fnInfoCallback = function(oSettings,
					iStart, iEnd, iMax, iTotal, sPre) {
				var usr_callbck = that._data.user_fnInfoCallBack;

				if (usr_callbck) {
					sPre = usr_callbck.call(oSettings.oInstance, oSettings,
							iStart, iEnd, iMax, iTotal, sPre);
				}
				var iSelCount = that.fnSelectionCount();
				var message = that.s.infoMessage;
				if (message && iSelCount) {
					sPre = sPre
							+ message.replace(/_SEL-VISIBLE-COUNT_/g,
									that.fnVisibleRowsSelecteds()).replace(
									/_SEL-COUNT_/g, iSelCount);
				}
				return sPre;
			};
		},

		/**
		 * Update datatables information message if its needed
		 */
		"_fnUpdateInfo" : function() {
			if (this.s.infoMessage) {
				this._data.dt.oApi._fnUpdateInfo(this._data.dt);
			}
		},

		/**
		 * update graphically a row (node)
		 * 
		 * @param nRow
		 * @param selectec
		 */
		"_fnUpdateRowTr" : function(nRow, selected) {
			var s = this.s;
			var classToAdd = null, classToRemve = null, checkValue = null;

			// prepare values
			if (selected) {
				// add selected class
				classToAdd = s.classForSelectedRow;
				// check for not-select class
				classToRemove = s.classForNotSelectedRow ? s.classForNotSelectedRow
						: null;
				// check if input must be checked
				checkValue = s.checkColumnClass ? true : null;
			} else {
				// remove selected class
				classToRemove = s.classForSelectedRow;
				// check for not-select class
				classToAdd = s.classForNotSelectedRow ? s.classForNotSelectedRow
						: null;
				// check if input must be unchecked
				checkValue = s.checkColumnClass ? false : null;
			}
			if (s.debug) {
				log("_fnUpdateRowTr: id=" + nRow.id + " +" + classToAdd + " -"
						+ classToRemove + " check:" + checkValue);
			}
			// update row values
			var $nRow = $(nRow);
			if (classToAdd) {
				$nRow.addClass(classToAdd);
			}
			if (classToRemove) {
				$nRow.removeClass(classToRemove);
			}
			if (checkValue != null) {
				var checkbox = $("input." + s.checkColumnClass + ":checkbox",
						nRow);
				checkbox.prop('checked', checkValue);
			}
		},

		/**
		 * Bind click event of a row to toggle select action
		 * 
		 * @param nRow
		 *            (node)
		 */
		"_fnBindClickEvent" : function(nRow) {
			
			if (!nRow){
				// nothing to do
				return;
			}

			var that = this, s = this.s;

			if (nRow.selection_binded) {
				// already binded
				return;
			}
			if (s.checkColumnClass) {
				// bind checkbox
				var checkbox = $("input." + s.checkColumnClass + ":checkbox",
						nRow);
				checkbox.on('change', function() {
					var id = $(this).closest('tr').prop('id');
					if (this.checked) {
						that.fnSelect(id);
					} else {
						that.fnDeselect(id);
					}
				});

			} else {
				// bind row click
				$(nRow).on('click', function() {
					that.fnToggleSelect(this.id);
				});
			}
			nRow.selection_binded = true;
		},

		/**
		 * Initialize componente
		 */
		"_fnConstruct" : function(iSettings) {
			var s = this.s, _d = this._data, dt = _d.dt;
			// initialize settings
			if (typeof iSettings == "object") {
				if (iSettings.multiRow !== undefined) {
					s.multiRow = iSettings.multiRow;
				}
				if (iSettings.checkColumnClass !== undefined) {
					s.checkColumnClass = iSettings.checkColumnClass;
				}
				if (iSettings.classForSelectedRow !== undefined) {
					s.classForSelectedRow = iSettings.classForSelectedRow;
				}
				if (iSettings.classForNotSelectedRow !== undefined) {
					s.classForNotSelectedRow = iSettings.classForNotSelectedRow;
				}
				if (iSettings.infoMessage !== undefined) {
					s.infoMessage = iSettings.infoMessage;
				}
				if (iSettings.debug !== undefined) {
					s.debug = iSettings.debug;
				}
			}

			// Initialize Variables to store data
			_d.idList = [];
			_d.idListSelected = true;
			_d.selectedAll = false;

			// Register click on current rows
			var aoData = dt.aoData;
			for ( var i = 0; i < aoData.length; i++) {
				var nRow = aoData[i].nTr;
				this._fnBindClickEvent(nRow);
			}

			// Register Row callback without remove user configuration
			this._fnRegisterDrawSelectionRowCallback();

			// Register callback to update info label
			this._fnRegisterSelectionInfoCallback();

			// Update visible rows
			this.fnRedrawVisibleRows();
		}

	};

	/***************************************************************************
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Static variables * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 */

	/**
	 * Store of all instances that have been created of TableTools, so one can
	 * look up other (when there is need of a master)
	 * 
	 * @property _aInstances
	 * @type Array
	 * @default []
	 * @private
	 */
	GvNIX_Selection._aInstances = [];
	
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Static methods
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

	/**
	 * Get the instance for a table node (or id if a string is given)
	 *  @method  fnGetInstance
	 *  @returns {Object} ID of table OR table node, for which we want the GvNIX_Seletion instance
	 *  @static
	 */
	GvNIX_Selection.fnGetInstance = function ( node )
	{
		if ( typeof node != 'object' )
		{
			node = $("#"+node);
		}
		
		if (node.dataTable === undefined){
			throw "Datatable not found: "+ node;
		}
		var dt = node.dataTable();
		
		for ( var i=0, iLen=GvNIX_Selection._aInstances.length ; i<iLen ; i++ )
		{
			if ( GvNIX_Selection._aInstances[i]._data.dt == dt )
			{
				return GvNIX_Selection._aInstances[i];
			}
		}
		return null;
	};
	
	
	/**
	 * Name of this class
	 *  @constant CLASS
	 *  @type	 String
	 *  @default  TableTools
	 */
	GvNIX_Selection.prototype.CLASS = "GvNIX_Selection";
	
	/**
	 * TableTools version
	 *  @constant  VERSION
	 *  @type	  String
	 *  @default   See code
	 */
	GvNIX_Selection.VERSION = "${gvnix.version}";
	GvNIX_Selection.prototype.VERSION = GvNIX_Selection.VERSION;


	/** TODO Add as datatable feature  **/
	
	
})(jQuery, window, document);

/** *********************************************** */

/**
 * 
 * Gets/initialize gvnix Selection support on a datatables
 * 
 * @author gvNIX Team
 */
jQuery.fn.dataTableExt.oApi.fnSelection = function(oSettings,
		iSelectionSettings) {
	var _that = this;

	var selectionSupport = oSettings.gvnix_selection_support;
	if (oSettings.gvnix_selection_support === undefined) {
		selectionSupport = new GvNIX_Selection(oSettings,
				iSelectionSettings);
	} else {
		// TODO adjust settings on already initialized selection support

	}

	oSettings.gvnix_selection_support = selectionSupport;

	return selectionSupport;
}