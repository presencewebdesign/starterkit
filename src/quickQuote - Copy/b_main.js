/*! 
 * step.form.js
 * Author James Stevenson
 * This is used for staging the form into steps apply the validation and applyu the API
 */

$(document).ready(function () {

    $('#DateOfBirth, #Spouse').on('change', function (e) {
        var defaultquotetype = $('#defaultQuoteType').val();

        if(defaultquotetype != "SAI") {

            // GP registration
            displayOption(true, '#DateOfBirth-GPregistration');

            let StartDate = $('#StartDate').val()
            let elem = $(this).attr('id')
            let DateOfBirth = $(this).val()
    
            let json = {
                'StartDate': StartDate, 
                'DateOfBirth': DateOfBirth, 
                elem
            }
        
            let jsonNew = dobFormat(JSON.stringify(json))
            changeOptions(JSON.parse(jsonNew))
        }
    })

    $('#BasicAnnualSalary, #sumInsured').change(function(event) {
        // skip for arrow keys
        if(event.which >= 37 && event.which <= 40){
            event.preventDefault();
        }
        $(this).val(function(index, value) {
            return value
                .replace(/\D/g, '')
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        });
    });

    // RUN FUNCTION Show/Hide fields and brochure links
    sportType($("#sportQuote [name=defaultquotetype]").val());

    $( "#sportQuote input[name=IndividualTeam]" ).change(function() {
        var option = $(this).val();
        if(option == "I") {
            displayOption(true, '.SAI');
            displayOption(false, '#teamInfo');
            displayOption(true, '#employmentclass');

        } else if (option == "T") {
            displayOption(false, '.SAI');
            displayOption(true, '#teamInfo');
            displayOption(false, '#employmentclass');
        }
    });

    // On Change product quote type dropdown 
    $( "#sportQuote [name=defaultquotetype]" ).change(function() {
        var quoteFormSubmit = $('a#finish, #sportSubmit');
        $(quoteFormSubmit).html('See My Quotes');

        var quoteType = $(this).val();
        // Reset check boxes
        $('input[type=radio]').prop('checked', false);
        sportType(quoteType);
        // TagRecording("Sport Quote");
        notice(false, ".quoteForm");
    });

    // Check if age from DOB is 16 or under 16
    
    $( "#sportQuote input[name='MainMember.DateOfBirth']" ).change(function() {

        var myDate = $(this).val();
        var defaultquotetype = $('#defaultQuoteType').val();

        console.log(defaultquotetype)

        if(getAge(myDate) <= 15 && defaultquotetype === "SAI") {
            displayOption(true, '#checkBoxUnder16');
            $('select[name=EmploymentClassId]').val(1).attr('selected', true);
            $('select[name=EmploymentClassId]').find('option:not(:nth-child(2))').attr('disabled','disabled');
        }else{
            displayOption(false, '#checkBoxUnder16');
            $('select[name=EmploymentClassId]').val(0).attr('selected', true);
            $('select[name=EmploymentClassId]').find('option:not(:nth-child(2))').removeAttr('disabled','disabled');
        }
    });

    // UX Tool Used for searching a long list of options in teh dropdown
    $(document).ready(function() {
        // Initialize select2
        $(".shi, .sai").select2();
        $('.shi, .sai').val(getQueryString('id'));
        $('.shi, .sai').trigger('change');
    });


    $.validator.addMethod("validDateOfBirth",
        function(value) {
            // load function to return bool
            return isValidDate(value);

        }, function(params) {

            var invalidEmail = "Date is invalid";
            return invalidEmail;
    });

    $("#sportQuote").submit(function(e) {
        e.preventDefault();
    }).validate({
        rules : {
            'contractStartDate' : {
                validDateOfBirth: true,
            },
            'contractEndDate' : {
                validDateOfBirth: true,
            },
            'StartDate' : {
                validDateOfBirth: true,
            },
            'MainMember.DateOfBirth' : {
                validDateOfBirth: true,
            },
            'Spouse.DateOfBirth' : {
                validDateOfBirth: true,
            },
            'familyMembers.0.dateOfBirth' : {
                validDateOfBirth: true,
            },
            'familyMembers.1.dateOfBirth' : {
                validDateOfBirth: true,
            },
            'familyMembers.2.dateOfBirth' : {
                validDateOfBirth: true,
            },
            'familyMembers.3.dateOfBirth' : {
                validDateOfBirth: true,
            },
            'familyMembers.4.dateOfBirth' : {
                validDateOfBirth: true,
            },
            'familyMembers.5.dateOfBirth' : {
                validDateOfBirth: true,
            }
        },
        submitHandler: function(form) { 

            var formID = $('#sportQuote');
            // note: turn off pretty printing in production
            var json = $("#sportQuote").formToJson({
                pretty: true
            });

            // Check which results page to display.
            var defaultquotetype = $('input[name=defaultquotetype]').val();

            if (defaultquotetype != "CHI") {
                // Adding family members
                var json = AddFamilyMembers(json);
            }
            
            var json = dobFormat(json);

            // Load results and enpoint URL's depending if corporate, personal or sport SAI/SHI
            api_redirect_url(formID, json, defaultquotetype);
        }
    });

    // ** ------------------------------------------
    // Standard Default Quote Form
    // $('#title').on('change', function (e) {
    //     TagRecording("Quote");
    // });

    $("input[name='Spouse.DateOfBirth']").prop("disabled", true);
    $("input[name='Spouse.DateOfBirth_submit']").prop("disabled", true);

    function spouseDisable(bool, element) {
        $("input[name='Spouse.DateOfBirth']").prop("disabled", bool);
        $('select[name="Spouse.minimumGpRegistrationId"]').prop("disabled", bool);
        $(element).prop("disabled", bool);
    }

    $('input[name=addSpouse]').on('change', function (e) {
        if($(this).val() == "true") {
            $('#spouse-dob').show();
            spouseDisable(false, '#spouse-dob');
        }else{
            $('#spouse-dob').hide();
            $('input[name="Spouse.DateOfBirth"]').val('');
            spouseDisable(true);
        }
    });
});

$(document).ready(function() {
    $("#DateOfBirth").mask('99-99-9999')
    $("#Spouse").mask("99-99-9999")
    $("#StartDate").mask("99-99-9999")
});