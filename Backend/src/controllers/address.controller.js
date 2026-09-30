const FIELDS = [ "name", "phone", "line1", "line2", "city", "state", "pincode" ]

const clean = body => Object.fromEntries(FIELDS.map(field => [ field, String(body[ field ] ?? "").trim() ]))

const validate = address => {
    if (address.name.length < 2) return "Please enter the name of the recipient"
    if (!/^\d{10}$/.test(address.phone)) return "Phone number must be 10 digits"
    if (address.line1.length < 3) return "Please enter the address line"
    if (!address.city) return "City is required"
    if (!address.state) return "State is required"
    if (!/^\d{6}$/.test(address.pincode)) return "Pincode must be 6 digits"
    return null
}

const respond = (res, user, message) => res.status(200).json({ success: true, message, addresses: user.addresses })

export const getAddresses = async (req, res) => respond(res, req.user, "Addresses fetched")

export const addAddress = async (req, res) => {
    const address = clean(req.body)
    const problem = validate(address)

    if (problem) return res.status(400).json({ message: problem, success: false })

    if (req.user.addresses.length >= 10) {
        return res.status(400).json({ message: "You can save up to 10 addresses", success: false })
    }

    const makeDefault = req.body.isDefault === true || req.user.addresses.length === 0

    if (makeDefault) req.user.addresses.forEach(item => { item.isDefault = false })

    req.user.addresses.push({ ...address, isDefault: makeDefault })
    await req.user.save()

    return respond(res, req.user, "Address saved")
}

export const updateAddress = async (req, res) => {
    const target = req.user.addresses.id(req.params.addressId)

    if (!target) return res.status(404).json({ message: "Address not found", success: false })

    const address = clean({ ...target.toObject(), ...req.body })
    const problem = validate(address)

    if (problem) return res.status(400).json({ message: problem, success: false })

    if (req.body.isDefault === true) req.user.addresses.forEach(item => { item.isDefault = false })

    target.set({ ...address, ...(req.body.isDefault === true ? { isDefault: true } : {}) })
    await req.user.save()

    return respond(res, req.user, "Address updated")
}

export const deleteAddress = async (req, res) => {
    const target = req.user.addresses.id(req.params.addressId)

    if (!target) return res.status(404).json({ message: "Address not found", success: false })

    const wasDefault = target.isDefault
    target.deleteOne()

    if (wasDefault && req.user.addresses.length) req.user.addresses[ 0 ].isDefault = true

    await req.user.save()

    return respond(res, req.user, "Address removed")
}
