const createLoginForm = () => {
    return forms.create({
        'email': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'password': fields.password({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
    })
}

// const createProductForm = () => {
//     return forms.create({
//         'name': fields.string({
//             required: true,
//             errorAfterField: true,
//             cssClasses: {
//                 label: ['form-label']
//             },
//             'validators':[validators.integer()]
//         }),
        
//         'cost': fields.string({
//             required: true,
//             errorAfterField: true,
//             cssClasses: {
//                 label: ['form-label']
//             }
//         }),
//         'description': fields.string({
//             required: true,
//             errorAfterField: true,
//             cssClasses: {
//                 label: ['form-label']
//             }
//         }),
//     })
// };

const createProductForm = (categories) => {
    return forms.create({
        'name': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'cost': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            'validators':[validators.integer()]
        }),
        'description': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'category_id': fields.string({
            label:'Category',
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            widget: widgets.select(),
            choices: categories
        }),
        'tags': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            widget: widgets.multipleSelect(),
            choices:tags
        })
    })
};



// module.exports = { createProductForm, 
    // createRegistrationForm,
    // createLoginForm, 
    // bootstrapField };