let mode="add";
let CodePaillasse;
let CurrentUser="";


$(document).ready(function () {
  

    drawDatatables();
    bindEvents();
    addRequiredInputs();
    
    
    

});
addRequiredInputs = () => {
    let elements = $('input[required] , select[required], textarea[required], div[required]');
    for (const element of elements) {
        let label = $(element).parent('div').find('label');
        if (label.length === 0)
            label = $(element).parent('div').siblings('label');

        label.find('span').remove();
        label.append(`<span class="text-danger"> *</span>`);
    }
};
drawButtonsActionsCrud = (consultBtn = false, editBtn = false, deleteBtn = false, printRecuBtn = false, printCertifBtn) => {
    let htmlButtonConsult = '';
    let htmlButtonEdit = '';
    let htmlButtonDelete = '';
    let htmlButtonPrintRecu = '';
    let htmlButtonPrintCertif = '';
    if (consultBtn) {
        htmlButtonConsult = '<a href="javascript:void(0);" class="btn btn-sm btn-icon btn-outline-secondary rounded-circle mr-1 consultBtn"  title="' +
            i18n.t('commons.consulter') + '"  ><i class="fal fa-info"></i> </a>';
    }
    if (editBtn) {
        htmlButtonEdit = '<a href="javascript:void(0);" class="btn btn-sm btn-icon btn-outline-warning rounded-circle mr-1 editBtn"  title="' +
            i18n.t('commons.editer') + '"  ><i class="fal fa-pencil"></i> </a>';
    }
    if (deleteBtn) {
        htmlButtonDelete = '<a href="javascript:void(0);" class="btn btn-sm btn-icon btn-outline-danger rounded-circle mr-1 deleteBtn"  title="' +
            i18n.t('commons.supprimer') + '"  ><i class="fal fa-trash"></i> </a>';
    }
    if (printRecuBtn) {
        htmlButtonPrintRecu = '<a href="javascript:void(0);" class="btn btn-sm btn-icon btn-outline-primary rounded-circle mr-1 printRecuBtn"  title="' +
            i18n.t('commons.printRecu') + '"  ><i class="fal fa-print"></i> </a>';
    }

    if (printCertifBtn) {
        htmlButtonPrintCertif = '<a href="javascript:void(0);" class="btn btn-sm btn-icon btn-outline-primary rounded-circle mr-1 printCertifBtn"  title="' +
            i18n.t('commons.printCertif') + '" ><i class="fal fa-print"></i> </a>';
    }
    return '\n\t\t\t\t\t\t\t' + htmlButtonConsult + '\n\t\t\t\t\t\t\t' + htmlButtonEdit + '\n\t\t\t\t\t\t\t' + htmlButtonDelete + '\n\t\t\t\t\t\t\t' + '\n\t\t\t\t\t\t\t' + htmlButtonPrintRecu + '\n\t\t\t\t\t\t\t' + htmlButtonPrintCertif + '\n\t\t\t\t\t\t\t';

}
bindEvents = () => {


    $(document).on("click", "#Btn-Ajouter", function (e) {
        
        mode="add";
        openModal()   ; 
        CodePaillasse="";
        
    });
    $(document).on("click", ".editBtn", function (e) {
        CodePaillasse = $(this).closest('tr').find('td').eq(0).text();
        mode="update"
        openModal( ) ;
    });
    $(document).on("click", ".consultBtn", function (e) {
       mode="consult";
       CodePaillasse = $(this).closest('tr').find('td').eq(0).text();
       openModal() ;
     
    });
    $(document).on("click", ".deleteBtn", function (e) {
        mode="delete";
        CodePaillasse = $(this).closest('tr').find('td').eq(0).text();        mode="delete";
        openModal( ) ;
    });
    $(document).on("click", "#Btn-Actualiser", function (e) {
        redrawDatatables();
    });

    $('#btnVld').on('click', function() {
        if ((mode=== 'add') || (mode=== 'update')) {
             validerDonneesPaillasse(mode);
        }else if (mode=== 'delete'){
                SuprimerPaillasse( );
    
            }    

    });


}



drawDatatables = () => {
    GetPaillasses().then(function (value) {
       createDataTables({
           element: "#dt_listPaillasses",
           data: value,
           columns: getColumns(),
           buttons: [],
           select: 'single',
           columnFilter: true,
           order: [2, 'asc'],
           ordering: true,
           scrollY: $(window).height() - 240,           

           
           callback: () => {
              // hideLoading();
           }
       });
      
   }).catch(err => {
       console.error("Erreur lors du chargement des paillasses:", err);
       //hideLoading();
   });
};
getColumns = () => {
   const columnsSet = [
       {
           title: i18n.t("commons.code"),
           id: 'codePaillasse',
           data: 'codePaillasse',
       },
       {
           title: i18n.t("commons.designation"),
           id: 'desigation',
           data: 'desigation',
       },
       {
           title: i18n.t("commons.ordre"),
           id: 'numOrdre',
           data: 'numOrdre',
       },
       {
           title: i18n.t("commons.actions"),
           data: null,
           width: '100px',
           type: "actions",
           render: function(data, type, full) {
               return drawButtonsActionsCrud(true, true, true, false, false);
           }
       },
   ];
   return columnsSet;
};

function redrawDatatables() {

   GetPaillasses().then(function (value) {
       let table = $("#dt_listPaillasses").DataTable();
       updateDataTable(table, value);
       
   }).catch(err => {
       console.error("Erreur lors de la mise à jour des Paillasses :", err);
   });
}

function  GetPaillasses () 
{
  //  showLoading();
    return new Promise(function (resolve, reject) {
        axios.get(`${Ressources.CoreUrl}/Paillasses`).then(function (response) {
            console.log(response); 
            resolve(response.data);
            value =response.data;
        }).catch(reject);
    });
};
function openModal( ) {
   
    var modal = $('#modalPaillasse');
    CurrentUser = JSON.parse(localStorage.getItem("user")).userName;
    
 let title ="";
  if (mode=== 'add') {
     GetCode();
      title =i18n.t("pages.Paillasses.AddPaillasse"); 
     changeToReadonly(modal, false);
      $('#btnVld').show();      

  } else if (mode=== 'update') {

      title =i18n.t("pages.Paillasses.modifierPaillasse");  
      $('#btnVld').show();
      changeToReadonly(modal, false);
      AfficherDonneesPaillasse();
      
  }else if (mode=== 'consult') {
      title =i18n.t("pages.Paillasses.ViewPaillasse");
       $('#btnVld').hide();
       changeToReadonly(modal, true);
      AfficherDonneesPaillasse();
  }else if (mode=== 'delete'){
    title =i18n.t("pages.Paillasses.supPaillasse")  ;
    AfficherDonneesPaillasse();
     changeToReadonly(modal, true);
    $('#btnVld').show();
  }
  document.getElementById('modalTitle').textContent  = title;
  modal.modal('show');    
}

function validerDonneesPaillasse(mode) {
    

    if (!validRequiredInputs( $("#modalPaillasse"))) {
        
        toastr.error(i18n.t("commons.required"));
        return;
    }
    
    let paillasse = {

        CodePaillasse: CodePaillasse ,       
        Desigation:   $("#txtdesignation").val(),
        NumOrdre:  $("#txtordre").val(),
    }; 


    if (mode=== 'add') {
       
        AddPaillasse(paillasse ).catch(function (error) {
            toastr.error( error);
            
        });      
    } else if (mode=== 'update') {
        
        updatePaillasse(paillasse).catch(function (error) {
            toastr.error( error);
            
        });
    }

    
        
       
        
};

function  AddPaillasse(paillasse) {
    
    numSocContact="";
return new Promise((resolve, reject) => {
    axios.post(`${Ressources.CoreLabo}/Paillasses`,paillasse )
    .then(response => {
    
        toastr.success("", i18n.t("message.MsgSuccesAjout"));
      
    redrawDatatables();
     $('#modalPaillasse').modal('hide');
         

    }) .catch(error => {
        //toastr.error("", i18n.t("message.MsgechecAjout"));   
            console.error("Error details:", error);
  var errorMsg = error.response && error.response.data 
    ? error.response.data.message || error.response.data 
    : error.message;
reject(errorMsg); 
        });
        
});
      





};
function SuprimerPaillasse() {
    
    axios.delete(`${Ressources.CoreLabo}/Paillasses/${ CodePaillasse}/${CurrentUser}`)
    .then(response => {
        
        toastr.success("", i18n.t("message.MsgSuccessupp"));
         redrawDatatables();
         $('#modalPaillasse').modal('hide');
    }).catch(error => {
            
            console.error("Error details:", error);
              var errorMsg = error.response && error.response.data 
             ? error.response.data.message || error.response.data 
             : error.message;
             toastr.error("", i18n.t("message.MsgechecSupp"));
             
        });
 
    
}

function updatePaillasse  (paillasse) {
return new Promise((resolve, reject) => {

   axios.put(`${Ressources.CoreLabo}/Paillasses/${CurrentUser}`, paillasse)
        .then(response => {
            toastr.success("", i18n.t("message.MsgSuccesModif"));
            console.log("Modifications enregistrées avec succès", response.data);
            
            $('#modalPaillasse').modal('hide');
            
            redrawDatatables();
        }).catch(error => {
            //toastr.error("", i18n.t("message.MsgechecModif"));
            
            console.error("Erreur lors de l'enregistrement des modifications :", error);
             var errorMsg = error.response && error.response.data 
              ? error.response.data.message || error.response.data 
               : error.message;
             reject(errorMsg); 
        });
});
}
function GetCode()
{
    axios.get(`${Ressources.CoreLabo}/Paillasses/GetcodePaillasse`)
        .then(response => {
            
            
            document.getElementById('txtcode').value = response.data; 
            
        })
        .catch(error => {
            console.error('Erreur:', error); // Gérer les erreurs
            alert('Une erreur s\'est produite lors de la récupération du code.');
        });
};
function changeToReadonly(modal, isReadonly) {
    var inputs = [
       '#txtdesignation',
       '#txtordre',
            
  ];
  
  inputs.forEach(selector => {
        modal.find(selector).prop('readonly', isReadonly);
  });
}

function AfficherDonneesPaillasse() {
  

    axios.get(`${Ressources.CoreLabo}/Paillasses/${ CodePaillasse}`)
        .then(response => {
            let data = response.data;
            console.log(data.contacts);

           
           $("#txtcode").val( CodePaillasse);           
           $("#txtdesignation").val(data.desigation);
           $("#txtordre").val(data.numOrdre);

        })
        .catch(error => {
            console.error("Error fetching  data:", error);
        });
         
};